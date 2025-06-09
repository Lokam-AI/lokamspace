import logging
import json
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from livekit import agents, api
from livekit.agents import Agent, AgentSession, RoomInputOptions, JobContext, function_tool, RunContext
from livekit.plugins import openai, cartesia, deepgram, noise_cancellation, silero
from livekit.agents.metrics import LLMMetrics, STTMetrics, EOUMetrics, TTSMetrics

from models.database import ServiceRecord, CallInteraction
from config.livekit import LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agent-service")

class ServiceAgent(Agent):
    def __init__(self, ctx: JobContext, db: Session = None):
        # Extract metadata from context
        self.metadata = {}
        if hasattr(ctx, 'metadata') and ctx.metadata:
            try:
                self.metadata = json.loads(ctx.metadata)
            except:
                pass
                
        # Store service information
        self.service_record_id = self.metadata.get('service_record_id')
        self.vehicle_number = self.metadata.get('vehicle_number')
        self.service_date = self.metadata.get('service_date')
        self.customer_name = getattr(ctx, 'customer_name', 'valued customer')
        
        # Store database session and context
        self.db = db
        self.ctx = ctx
        self._sess = None
        
        # Initialize metrics storage
        self.metrics = {
            "llm": [],
            "stt": [],
            "tts": [],
            "eou": [],
            "responses": []
        }
        
        # Configure components
        llm = openai.LLM(model="gpt-4o-mini")
        stt = deepgram.STT(model="nova-3")
        tts = cartesia.TTS(
            model="sonic-2",
            voice="1998363b-e108-4736-bc5b-1449fa2b096a",
            speed=0.5,
            emotion=["curiosity:highest", "positivity:high"]
        )
        silero_vad = silero.VAD.load()
        
        super().__init__(instructions=f"""
                You are a friendly and professional car service review collector. 
                Your role is to conduct post-service reviews with car owners in a conversational and engaging manner.
                
                Customer and Service Details:
                - Customer Name: {self.customer_name}
                - Vehicle Number: {self.vehicle_number if self.vehicle_number else 'Not provided'}
                - Service Date: {self.service_date if self.service_date else 'Not provided'}
                
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
                Start by introducing yourself as Ema, calling from mercedes benz dealership. 
                Address the customer by their name: "{self.customer_name}".
                Reference their recent service visit for their vehicle (number: {self.vehicle_number}) on {self.service_date}.
                Say that you are here to enhance their next car service experience.
                
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
                
                After the user answers each question:
                - Say "Thank you for your feedback" or similar phrases
                - If rating is 1-4: Show empathy, address them by name, and ask for specific areas of improvement
                - Move on to the next question
                
                Always maintain a positive and professional tone while collecting honest feedback.
                After completing all questions, thank the customer by their name for their time and valuable feedback.
                After thanking the customer, say "Have a great day" or similar phrases and end the call.
                
                Remember: 
                - Always address the customer as "{self.customer_name}" when appropriate
                - When the user indicates they want to end the call (through any ending phrase or explicit request), you MUST use the end_call tool to properly end the conversation.
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
        self._sess = session
        self.room = session.room
        logger.info(f"Session stored with room: {self.room.name}")
        
        # Update database if we have a service record
        if self.db and self.service_record_id:
            call_record = self.db.query(CallInteraction).filter(
                CallInteraction.service_record_id == self.service_record_id
            ).first()
            if call_record:
                call_record.status = "in_progress"
                call_record.call_date = datetime.utcnow()
                self.db.commit()

    async def on_session_end(self, session: AgentSession):
        """Called automatically by livekit-agents when the session ends."""
        logger.info("Session ended")
        
        if self.db and self.service_record_id:
            # Update service record status
            service_record = self.db.query(ServiceRecord).filter(
                ServiceRecord.id == self.service_record_id
            ).first()
            if service_record:
                service_record.status = "completed"
                self.db.commit()
            
            # Update call interaction record
            call_record = self.db.query(CallInteraction).filter(
                CallInteraction.service_record_id == self.service_record_id
            ).first()
            if call_record:
                call_record.status = "completed"
                call_record.completed_at = datetime.utcnow()
                call_record.transcription = await self.get_final_transcript()
                call_record.overall_feedback = await self.get_call_summary()
                
                # Update scores
                scores = await self.calculate_scores()
                call_record.overall_score = scores.get("overall", 0)
                call_record.timeliness_score = scores.get("timeliness", 0)
                call_record.cleanliness_score = scores.get("cleanliness", 0)
                call_record.advisor_helpfulness_score = scores.get("advisor_helpfulness", 0)
                call_record.work_quality_score = scores.get("work_quality", 0)
                call_record.recommendation_score = scores.get("recommendation", 0)
                
                self.db.commit()

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

        # Send a warm farewell message
        farewell_message = (
            f"Thank you {self.customer_name} for taking the time to provide your valuable feedback. "
            "Have a wonderful day, and we look forward to serving you again!"
        )
        
        try:
            await ctx.session.say(farewell_message)
            await asyncio.sleep(2)  # Wait for message delivery
        except Exception as e:
            logger.error(f"Error sending farewell message: {str(e)}")

        await self.hangup()

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

    async def get_final_transcript(self) -> str:
        """Get the final transcript of the call"""
        if not self._sess:
            return "No session data available"
        return json.dumps(self._sess.history.to_dict(), indent=2)

    async def get_call_summary(self) -> str:
        """Generate a summary of the call"""
        if not self._sess:
            return "No session data available"
        
        history = self._sess.history.to_dict()
        # You can implement more sophisticated summary generation here
        return json.dumps({
            "total_turns": len(history.get("turns", [])),
            "duration": (datetime.utcnow() - self._sess.start_time).total_seconds()
        })

    async def calculate_scores(self) -> dict:
        """Calculate scores from the conversation"""
        if not self._sess:
            return {}
            
        history = self._sess.history.to_dict()
        scores = {
            "overall": 0,
            "timeliness": 0,
            "cleanliness": 0,
            "advisor_helpfulness": 0,
            "work_quality": 0,
            "recommendation": 0
        }
        
        # Implement score extraction logic here
        # This is a placeholder - you should implement proper score extraction
        # based on your conversation analysis
        return scores

    async def on_llm_metrics_collected(self, metrics: LLMMetrics) -> None:
        """Log LLM metrics"""
        self.metrics["llm"].append({
            "prompt_tokens": metrics.prompt_tokens,
            "completion_tokens": metrics.completion_tokens,
            "tokens_per_second": metrics.tokens_per_second,
            "ttft": metrics.ttft
        })

    async def on_stt_metrics_collected(self, metrics: STTMetrics) -> None:
        """Log STT metrics"""
        self.metrics["stt"].append({
            "duration": metrics.duration,
            "audio_duration": metrics.audio_duration,
            "streamed": metrics.streamed
        })

    async def on_eou_metrics_collected(self, metrics: EOUMetrics) -> None:
        """Log End of Utterance metrics"""
        self.metrics["eou"].append({
            "end_of_utterance_delay": metrics.end_of_utterance_delay,
            "transcription_delay": metrics.transcription_delay
        })

    async def on_tts_metrics_collected(self, metrics: TTSMetrics) -> None:
        """Log TTS metrics"""
        self.metrics["tts"].append({
            "ttfb": metrics.ttfb,
            "duration": metrics.duration,
            "audio_duration": metrics.audio_duration,
            "streamed": metrics.streamed
        }) 