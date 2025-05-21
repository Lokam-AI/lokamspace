import logging
import re
from dotenv import load_dotenv
import os
import asyncio
import json
from datetime import datetime
import random
from livekit import api
from livekit import agents
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, RoomInputOptions,function_tool, RunContext, get_job_context
from livekit.plugins import (
    openai,
    elevenlabs,
    silero,
    deepgram,
    noise_cancellation,
    cartesia
)
from livekit.agents.metrics import LLMMetrics, STTMetrics, EOUMetrics, TTSMetrics


# Load environment variables
load_dotenv(override=True)


# Set up more detailed logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dlai-agent")
logger.setLevel(logging.INFO)


class CarServiceReviewAgent(Agent):
    def __init__(self,ctx: JobContext) -> None:
        logger.info("Initializing Car Service Review Agent...")
        
        #
        # Store the job context
        self.ctx = ctx
        
        # Initialize session as None
        self._sess = None
        
        # Initialize call status
        self.call_status = {
            "status": "initialized",
            "start_time": None,
            "end_time": None,
            "duration": None,
            "disconnect_reason": None
        }
        
        # Configure LLM with specific role and questionnaire
        llm = 
        #llm = openai.LLM.with_cerebras(model="llama3.1-8b", temperature=0.7 )
        
        # Configure STT for clear voice recognition
        stt = deepgram.STT(model="nova-3")
        
        #tts = deepgram.TTS(model="aura-2-andromeda-en")
        # Configure TTS with a friendly, professional voice
        tts = cartesia.TTS(
            model="sonic-2",
            voice="1998363b-e108-4736-bc5b-1449fa2b096a",
            speed=0.5,
            emotion=["curiosity:highest", "positivity:high"]
        )
        
        # Voice activity detection
        silero_vad = silero.VAD.load()
        
        logger.info("All components initialized successfully")

        super().__init__(
            instructions=f"""
                You are a friendly and professional car service review collector. 
                Your role is to conduct post-service reviews with car owners in a conversational and engaging manner.
                
                Key Guidelines:
                1. Be enthusiastic and professional
                2. Ask questions naturally, as if in a friendly conversation
                3. Listen carefully to responses
                4. Show empathy and understanding
                5. Thank customers for their time
                6. IMPORTANT: You MUST end the call when:
                   - The user says goodbye, bye, thank you, or any other ending phrase
                   - The user explicitly asks to end the call
                   - The user says they need to go
                   - The conversation has naturally concluded
                   - The appointment details have been confirmed
                   When any of these conditions are met, you MUST use the end_call tool to properly end the conversation.
         
                Initial Greeting:
                Start by introducing yourself as Ema, calling from mercedes benz dealership and greet the customer with the welcome message. Say that you are here to enhance their next car service experience.
                
                Review Questions and Rating System:
                Tell the customers that For each question, ask the customer to rate their experience on a scale of 1 to 10, where:
                - 1 is the lowest rating (extremely dissatisfied)
                - 10 is the highest rating (extremely satisfied)
                
                Questions to Ask (in order):
                1. "How would you rate your overall service experience? ."
                2. "Was the service completed on time? "
                3. "How would you rate the cleanliness of your vehicle after service? "
                4. "How would you rate the helpfulness and information provided by the service advisor? "
                5. "How would you rate the quality of the work performed on your vehicle? "
                6. "How likely are you to recommend our dealership to others? "
                
                After the the user ansers each question, say "Thank you for your feedback" or similar phrases and move on to the next question.
                - If rating is 1-4: Show empathy and ask for specific areas of improvement
                
                Always maintain a positive and professional tone while collecting honest feedback.
                After completing all questions, thank the customer by name for their time and valuable feedback.
                After thanking the customer, say "Have a great day" or similar phrases and end the call.
                
                Remember: When the user indicates they want to end the call (through any ending phrase or explicit request), you MUST use the end_call tool to properly end the conversation.
            """,
            stt=stt,
            llm=llm,
            tts=tts,
            vad=silero_vad
        )
        def llm_metrics_wrapper(metrics: LLMMetrics):
            asyncio.create_task(self.on_llm_metrics_collected(metrics))
        llm.on("metrics_collected", llm_metrics_wrapper)

        def stt_metrics_wrapper(metrics: STTMetrics):
            asyncio.create_task(self.on_stt_metrics_collected(metrics))
        stt.on("metrics_collected", stt_metrics_wrapper)

        def eou_metrics_wrapper(metrics: EOUMetrics):
            asyncio.create_task(self.on_eou_metrics_collected(metrics))
        stt.on("eou_metrics_collected", eou_metrics_wrapper)

        def tts_metrics_wrapper(metrics: TTSMetrics):
            asyncio.create_task(self.on_tts_metrics_collected(metrics))
        tts.on("metrics_collected", tts_metrics_wrapper)


    async def on_session_start(self, session: AgentSession):
        """
        Called automatically by livekit-agents when the session begins.
        """
        logger.info("Session started, storing session reference")
        self._sess = session      # keep handle for later
        self.room = session.room  # convenience, identical to ctx.room
        logger.info(f"Session stored with room: {self.room.name}")

    async def on_llm_metrics_collected(self, metrics: LLMMetrics) -> None:
        print("\n--- LLM Metrics ---")
        print(f"Prompt Tokens: {metrics.prompt_tokens}")
        print(f"Completion Tokens: {metrics.completion_tokens}")
        print(f"Tokens per second: {metrics.tokens_per_second:.4f}")
        print(f"TTFT: {metrics.ttft:.4f}s")
        print("------------------\n")

    async def on_stt_metrics_collected(self, metrics: STTMetrics) -> None:
        print("\n--- STT Metrics ---")
        print(f"Duration: {metrics.duration:.4f}s")
        print(f"Audio Duration: {metrics.audio_duration:.4f}s")
        print(f"Streamed: {'Yes' if metrics.streamed else 'No'}")
        print("------------------\n")

    async def on_eou_metrics_collected(self, metrics: EOUMetrics) -> None:
        print("\n--- End of Utterance Metrics ---")
        print(f"End of Utterance Delay: {metrics.end_of_utterance_delay:.4f}s")
        print(f"Transcription Delay: {metrics.transcription_delay:.4f}s")
        print("--------------------------------\n")

    async def on_tts_metrics_collected(self, metrics: TTSMetrics) -> None:
        print("\n--- TTS Metrics ---")
        print(f"TTFB: {metrics.ttfb:.4f}s")
        print(f"Duration: {metrics.duration:.4f}s")
        print(f"Audio Duration: {metrics.audio_duration:.4f}s")
        print(f"Streamed: {'Yes' if metrics.streamed else 'No'}")
        print("------------------\n")
    
    async def hangup(self) -> None:
     """
     Delete the LiveKit room to hang-up the call.
     Ensures the gRPC payload is always a plain string.
     """
     # 1.  Sanity checks
     if not hasattr(self, "ctx") or self.ctx is None:
         logger.error("Job context is missing – cannot hang-up.")
         return
     if not getattr(self.ctx, "room", None):
         logger.error("Room handle not present in context – cannot hang-up.")
         return

     # 2.  String-ify the room name (it might be a MagicMock in tests)
     room_name_obj = self.ctx.room.name
     room_name: str = str(room_name_obj)

     logger.info(f"Attempting to end call for room: {room_name!r}")

     # 3.  Call the LiveKit API
     try:
        await self.ctx.api.room.delete_room(
            api.DeleteRoomRequest(room=room_name)
        )
        logger.info(f"Successfully ended call for room: {room_name!r}")
     except Exception as exc:
        logger.exception("Error ending call via LiveKit")
        raise

    @function_tool()
    async def end_call(self, ctx: RunContext) -> None:
        """End the call when requested by the user."""
        logger.info("Ending the call")

        # Let the agent finish any current speech
        if current_speech := ctx.session.current_speech:
            await current_speech.wait_for_playout()

        # Store the session from context if not already stored
        if not self._sess:
            self._sess = ctx.session
            logger.info("Stored session from context")

        # Send a warm farewell message
        farewell_message = (
            "Thank you for taking the time to provide your valuable feedback. "
            "Have a wonderful day, and we look forward to serving you again!"
        )
        
        try:
            await ctx.session.say(farewell_message)
            # Wait for the message to be delivered
            await asyncio.sleep(2)
        except Exception as e:
            logger.error(f"Error sending farewell message: {str(e)}")

        self.update_call_status("completed", "user_ended")
        await self.hangup()

    @function_tool()
    async def detected_answering_machine(self, ctx: RunContext):
        """Called when the call reaches voicemail. Use this tool AFTER you hear the voicemail greeting"""
        logger.info(f"detected answering machine ")
        self.update_call_status("unanswered", "answering_machine")
        await self.hangup()         
    
    def update_call_status(self, status: str, disconnect_reason: str = None):
        """Update the call status with current information"""
        self.call_status["status"] = status
        if status == "initialized":
            self.call_status["start_time"] = datetime.now()
        elif status in ["completed", "unanswered"]:
            self.call_status["end_time"] = datetime.now()
            if self.call_status["start_time"]:
                self.call_status["duration"] = (self.call_status["end_time"] - self.call_status["start_time"]).total_seconds()
            self.call_status["disconnect_reason"] = disconnect_reason

    async def get_call_status(self) -> dict:
        """
        Get the current call status based on SIP participant attributes.
        Returns a dictionary with call status information.
        """
        if not self._sess:
            return self.call_status

        # Get all participants in the room
        participants = await self.room.list_participants()
        
        # Find SIP participants
        sip_participants = [p for p in participants if p.kind == "SIP"]
        
        if not sip_participants:
            return self.call_status

        # Get the first SIP participant's attributes
        sip_attrs = sip_participants[0].attributes
        
        # Map LiveKit SIP status to our status
        status_mapping = {
            "active": "active",
            "automation": "active",
            "dialing": "dialing",
            "hangup": "completed",
            "ringing": "ringing",
            "no-answer": "unanswered",
            "busy": "unanswered",
            "failed": "unanswered"
        }
        
        # Get the current status from SIP attributes
        current_status = sip_attrs.get("sip.callStatus", "unknown")
        mapped_status = status_mapping.get(current_status, "unknown")
        
        # Check for unanswered call timeout (if call has been ringing for too long)
        if mapped_status == "ringing" and self.call_status["start_time"]:
            ring_duration = (datetime.now() - self.call_status["start_time"]).total_seconds()
            if ring_duration > 60:  # 60 seconds timeout for unanswered calls
                mapped_status = "unanswered"
                self.update_call_status(mapped_status, "timeout")
                return self.call_status
        
        # Update our call status
        self.update_call_status(mapped_status)
        
        return self.call_status

async def run_analysis(api_key: str):
    """
    Directly execute the analysis from test_agent_analysis.py
    """
    try:
        from test_agent_analysis import ConversationAnalyzer
        import asyncio
        
        # Create analyzer instance with API key
        analyzer = ConversationAnalyzer(api_key)
        
        # Read conversation data from Transcription.json
        with open('Transcription.json', 'r') as file:
            conversation_data = json.load(file)
            
        # Get comprehensive analysis
        analysis = await analyzer.analyze_conversation(conversation_data)
        
        # Store the analysis in Feedback.json
        analyzer.store_analysis_to_json(analysis)
        
    except Exception as e:
        raise Exception(f"Error in analysis: {str(e)}")

async def entrypoint(ctx: JobContext):
    async def write_transcript():
        current_date = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Save transcript to Transcription.json in the current directory
        filename = f"Transcription.json"
        
        with open(filename, 'w') as f:
            json.dump(session.history.to_dict(), f, indent=2)
            
        print(f"Transcript for {ctx.room.name} saved to {filename}")

    async def run_post_session_analysis():
        try:
            import os
            
            # Get API key from environment variables
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                print("Error: OPENAI_API_KEY environment variable not found")
                return
                
            print("Starting conversation analysis...")
            await run_analysis(api_key)
            print("Analysis completed successfully")
            
        except Exception as e:
            print(f"Error running analysis: {str(e)}")

    # Add callbacks for transcript saving and analysis
    ctx.add_shutdown_callback(write_transcript)
    ctx.add_shutdown_callback(run_post_session_analysis)
    
    logger.info("Connecting to LiveKit...")
    await ctx.connect()
    logger.info("Connected successfully")
    
    try:
        # Start agent session
        agent   = CarServiceReviewAgent(ctx)
        session = AgentSession()
        logger.info("Starting agent session...")
        await session.start(
            room=ctx.room,
            agent=agent,
            room_input_options=RoomInputOptions(
                noise_cancellation.BVCTelephony(), 
            )
        )
        
    except Exception as e:
        logger.error(f"Error in entrypoint: {str(e)}")
        ctx.shutdown()
        raise

if __name__ == "__main__":
    worker_options = agents.WorkerOptions(
        entrypoint_fnc=entrypoint,
        agent_name="CarServiceReviewAgent"
    )
    agents.cli.run_app(worker_options)


        