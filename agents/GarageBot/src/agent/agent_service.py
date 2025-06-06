import logging
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from livekit import api
from livekit import agents
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, RoomInputOptions, function_tool, RunContext
from livekit.plugins import (
    openai,
    elevenlabs,
    silero,
    deepgram,
    noise_cancellation,
    cartesia
)
from livekit.agents.metrics import LLMMetrics, STTMetrics, EOUMetrics, TTSMetrics
import asyncio
import json

from ..db.models import CallInteraction, Feedback, Question
from ..config.livekit import LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_WS_URL

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agent_service")

class FeedbackAgent(Agent):
    def __init__(self, db: Session, call_record: CallInteraction):
        self.db = db
        self.call_record = call_record
        self._sess = None
        self.metrics = {
            "llm": [],
            "stt": [],
            "tts": [],
            "eou": [],
            "responses": []
        }
        self.current_question_index = 0
        self.questions = [
            "Overall service experience",
            "Service timeliness",
            "Vehicle cleanliness after service",
            "Service advisor helpfulness",
            "Work quality",
            "Likelihood to recommend"
        ]

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
        
        super().__init__(
            instructions="""
            You are Ema, a friendly and professional car service review collector. 
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
            
            After the user answers each question, say "Thank you for your feedback" or similar phrases and move on to the next question.
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

    async def on_session_start(self, session: AgentSession):
        """Handle session start"""
        logger.info("Session started, storing session reference")
        self._sess = session
        self.room = session.room
        logger.info(f"Session stored with room: {self.room.name}")
        
        self.call_record.status = "in_progress"
        self.call_record.metrics = self.metrics

    @function_tool
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
            "Thank you for taking the time to provide your valuable feedback. "
            "Have a wonderful day, and we look forward to serving you again!"
        )
        
        try:
            await ctx.session.say(farewell_message)
            # Wait for the message to be delivered
            await asyncio.sleep(2)
        except Exception as e:
            logger.error(f"Error sending farewell message: {str(e)}")

        await self.hangup(ctx)

    @function_tool
    async def detected_answering_machine(self, ctx: RunContext):
        """Called when the call reaches voicemail. Use this tool AFTER you hear the voicemail greeting"""
        logger.info("Detected answering machine")
        await self.hangup(ctx)

    async def hangup(self, ctx: RunContext) -> None:
        """Delete the LiveKit room to hang-up the call."""
        if not hasattr(ctx, "room"):
            logger.error("Room handle not present in context – cannot hang-up.")
            return

        room_name = str(ctx.room.name)
        logger.info(f"Attempting to end call for room: {room_name!r}")

        try:
            await ctx.api.room.delete_room(room_name)
            logger.info(f"Successfully ended call for room: {room_name!r}")
        except Exception as exc:
            logger.exception("Error ending call via LiveKit")
            raise

class AgentService:
    def __init__(self, db: Session):
        self.db = db

    async def start_agent(self, room_name: str, call_record: CallInteraction) -> None:
        """Start the feedback agent in a LiveKit room"""
        try:
            # Create agent session with all necessary components
            session = AgentSession(
                stt=deepgram.STT(model="nova-3"),
                llm=openai.LLM(model="gpt-4o-mini"),
                tts=cartesia.TTS(
                    model="sonic-2",
                    voice="1998363b-e108-4736-bc5b-1449fa2b096a",
                    speed=0.5,
                    emotion=["curiosity:highest", "positivity:high"]
                ),
                vad=silero.VAD.load()
            )
            
            # Create the agent
            agent = FeedbackAgent(self.db, call_record)
            
            logger.info("Starting agent session...")
            await session.start(
                room=room_name,
                agent=agent,
                room_input_options=RoomInputOptions(
                    noise_cancellation=noise_cancellation.BVCTelephony()
                )
            )
            
            logger.info(f"Agent dispatched to room: {room_name}")
            
        except Exception as e:
            logger.error(f"Error starting agent: {str(e)}")
            raise

if __name__ == "__main__":
    # This allows the agent to be run standalone for testing
    worker_options = WorkerOptions(
        entrypoint_fnc=lambda ctx: FeedbackAgent(ctx, None),
        agent_name="garagebot-feedback-agent"
    )
    agents.cli.run_app(worker_options)
