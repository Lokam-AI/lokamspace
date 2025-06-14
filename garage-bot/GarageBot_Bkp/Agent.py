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
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, RoomInputOptions, function_tool, RunContext, get_job_context
from livekit.plugins import (
    openai,
    elevenlabs,
    silero,
    deepgram,
    noise_cancellation,
    cartesia
)
from livekit.agents.metrics import LLMMetrics, STTMetrics, EOUMetrics, TTSMetrics
from sqlalchemy.orm import Session
import sys

# Add the project root directory to Python path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(project_root)

from src.db import CallInteraction, Feedback


# Load environment variables
load_dotenv(override=True)


# Set up more detailed logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dlai-agent")
logger.setLevel(logging.INFO)


class CarServiceReviewAgent(Agent):
    def __init__(self, ctx: JobContext, db: Session = None) -> None:
        logger.info("Initializing Car Service Review Agent...")
        
        # Store the job context and database session
        self.ctx = ctx
        self.db = db
        
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
        
        # Get call ID from metadata if available
        self.call_id = None
        if hasattr(ctx, 'metadata') and ctx.metadata:
            try:
                metadata = json.loads(ctx.metadata)
                self.call_id = metadata.get('call_id')
            except:
                pass
        
        # Configure LLM with specific role and questionnaire
        llm = openai.LLM(model="gpt-4o-mini")
        
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
        
        # Set up metrics collection
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
        """Called automatically by livekit-agents when the session begins."""
        logger.info("Session started, storing session reference")
        self._sess = session      # keep handle for later
        self.room = session.room  # convenience, identical to ctx.room
        logger.info(f"Session stored with room: {self.room.name}")

        # Update call status
        self.update_call_status("in_progress")
        
        # Update database if we have a call record
        if self.db and self.call_id:
            call_record = self.db.query(CallInteraction).filter(CallInteraction.id == self.call_id).first()
            if call_record:
                call_record.transcription = "Call started..."
                self.db.commit()

    async def on_session_end(self, session: AgentSession):
        """Called automatically by livekit-agents when the session ends."""
        logger.info("Session ended")
        
        # Update call status
        self.update_call_status("completed")
        
        # Update database if we have a call record
        if self.db and self.call_id:
            call_record = self.db.query(CallInteraction).filter(CallInteraction.id == self.call_id).first()
            if call_record:
                # Get the final transcript and summary
                transcript = await self.get_final_transcript()
                summary = await self.get_call_summary()
                
                call_record.transcription = transcript
                call_record.summary = summary
                
                # Create feedback record
                feedback = Feedback(
                    call_id=self.call_id,
                    score=await self.calculate_overall_score(),
                    sentiment=await self.analyze_sentiment(),
                    key_points=await self.extract_key_points(),
                    tone=await self.analyze_tone(),
                    comments=await self.get_final_comments()
                )
                self.db.add(feedback)
                self.db.commit()
    
    async def get_final_transcript(self) -> str:
        """Get the final transcript of the call"""
        # This should be implemented to get the actual transcript
        return "Call transcript will be updated here"

    async def get_call_summary(self) -> str:
        """Get a summary of the call"""
        # This should be implemented to generate a summary
        return "Call summary will be updated here"

    async def calculate_overall_score(self) -> int:
        """Calculate the overall satisfaction score"""
        # This should be implemented to calculate the score
        return 8

    async def analyze_sentiment(self) -> str:
        """Analyze the sentiment of the call"""
        # This should be implemented to analyze sentiment
        return "Positive"

    async def extract_key_points(self) -> str:
        """Extract key points from the call"""
        # This should be implemented to extract key points
        return "Key points will be updated here"

    async def analyze_tone(self) -> str:
        """Analyze the tone of the call"""
        # This should be implemented to analyze tone
        return "Satisfied"

    async def get_final_comments(self) -> str:
        """Get final comments about the call"""
        # This should be implemented to get final comments
        return "Final comments will be updated here"

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
                duration = (self.call_status["end_time"] - self.call_status["start_time"]).total_seconds()
                self.call_status["duration"] = duration
            self.call_status["disconnect_reason"] = disconnect_reason

    async def get_call_status(self) -> dict:
        """Get the current call status"""
        return self.call_status

    async def hangup(self) -> None:
        """Delete the LiveKit room to hang-up the call."""
        if not hasattr(self, "ctx") or self.ctx is None:
            logger.error("Job context is missing – cannot hang-up.")
            return
        if not getattr(self.ctx, "room", None):
            logger.error("Room handle not present in context – cannot hang-up.")
            return

        room_name = str(self.ctx.room.name)
        logger.info(f"Attempting to end call for room: {room_name!r}")

        try:
            await self.ctx.api.room.delete_room(
                api.DeleteRoomRequest(room=room_name)
            )
            logger.info(f"Successfully ended call for room: {room_name!r}")
        except Exception as exc:
            logger.exception("Error ending call via LiveKit")
            raise

    async def on_llm_metrics_collected(self, metrics: LLMMetrics) -> None:
        """Log LLM metrics and store them in the database"""
        logger.info("\n--- LLM Metrics ---")
        logger.info(f"Prompt Tokens: {metrics.prompt_tokens}")
        logger.info(f"Completion Tokens: {metrics.completion_tokens}")
        logger.info(f"Tokens per second: {metrics.tokens_per_second:.4f}")
        logger.info(f"TTFT: {metrics.ttft:.4f}s")
        logger.info("------------------\n")
        
        # Store metrics in database if we have a call record
        if self.db and self.call_id:
            call_record = self.db.query(CallInteraction).filter(CallInteraction.id == self.call_id).first()
            if call_record:
                # Add metrics to the transcription field as JSON
                metrics_data = {
                    "llm_metrics": {
                        "prompt_tokens": metrics.prompt_tokens,
                        "completion_tokens": metrics.completion_tokens,
                        "tokens_per_second": metrics.tokens_per_second,
                        "ttft": metrics.ttft
                    }
                }
                call_record.transcription = json.dumps(metrics_data)
                self.db.commit()

    async def on_stt_metrics_collected(self, metrics: STTMetrics) -> None:
        """Log STT metrics and store them in the database"""
        logger.info("\n--- STT Metrics ---")
        logger.info(f"Duration: {metrics.duration:.4f}s")
        logger.info(f"Audio Duration: {metrics.audio_duration:.4f}s")
        logger.info(f"Streamed: {'Yes' if metrics.streamed else 'No'}")
        logger.info("------------------\n")
        
        # Store metrics in database if we have a call record
        if self.db and self.call_id:
            call_record = self.db.query(CallInteraction).filter(CallInteraction.id == self.call_id).first()
            if call_record:
                # Add metrics to the transcription field as JSON
                metrics_data = json.loads(call_record.transcription) if call_record.transcription else {}
                metrics_data["stt_metrics"] = {
                    "duration": metrics.duration,
                    "audio_duration": metrics.audio_duration,
                    "streamed": metrics.streamed
                }
                call_record.transcription = json.dumps(metrics_data)
                self.db.commit()

    async def on_eou_metrics_collected(self, metrics: EOUMetrics) -> None:
        """Log End of Utterance metrics and store them in the database"""
        logger.info("\n--- End of Utterance Metrics ---")
        logger.info(f"End of Utterance Delay: {metrics.end_of_utterance_delay:.4f}s")
        logger.info(f"Transcription Delay: {metrics.transcription_delay:.4f}s")
        logger.info("--------------------------------\n")
        
        # Store metrics in database if we have a call record
        if self.db and self.call_id:
            call_record = self.db.query(CallInteraction).filter(CallInteraction.id == self.call_id).first()
            if call_record:
                # Add metrics to the transcription field as JSON
                metrics_data = json.loads(call_record.transcription) if call_record.transcription else {}
                metrics_data["eou_metrics"] = {
                    "end_of_utterance_delay": metrics.end_of_utterance_delay,
                    "transcription_delay": metrics.transcription_delay
                }
                call_record.transcription = json.dumps(metrics_data)
                self.db.commit()

    async def on_tts_metrics_collected(self, metrics: TTSMetrics) -> None:
        """Log TTS metrics and store them in the database"""
        logger.info("\n--- TTS Metrics ---")
        logger.info(f"TTFB: {metrics.ttfb:.4f}s")
        logger.info(f"Duration: {metrics.duration:.4f}s")
        logger.info(f"Audio Duration: {metrics.audio_duration:.4f}s")
        logger.info(f"Streamed: {'Yes' if metrics.streamed else 'No'}")
        logger.info("------------------\n")
        
        # Store metrics in database if we have a call record
        if self.db and self.call_id:
            call_record = self.db.query(CallInteraction).filter(CallInteraction.id == self.call_id).first()
            if call_record:
                # Add metrics to the transcription field as JSON
                metrics_data = json.loads(call_record.transcription) if call_record.transcription else {}
                metrics_data["tts_metrics"] = {
                    "ttfb": metrics.ttfb,
                    "duration": metrics.duration,
                    "audio_duration": metrics.audio_duration,
                    "streamed": metrics.streamed
                }
                call_record.transcription = json.dumps(metrics_data)
                self.db.commit()

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


        