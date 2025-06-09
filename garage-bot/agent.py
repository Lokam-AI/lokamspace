from livekit import agents
from livekit.agents import AgentSession, RoomInputOptions, JobContext
from livekit.plugins import deepgram, noise_cancellation, silero, cartesia, openai
import logging
from dotenv import load_dotenv
import os

from config.database import init_db, get_db
from services.agent_service import ServiceAgent
from models.database import ServiceRecord, CallInteraction

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("garage-bot")

# Load environment variables
load_dotenv()

# Initialize database only if not skipped
if not os.getenv("SKIP_DB_INIT"):
    init_db()

async def entrypoint(ctx: JobContext):
    """Main entrypoint for the agent"""
    logger.info("Starting agent entrypoint")
    
    # Initialize and connect to LiveKit
    await ctx.connect()
    
    # Get database session
    db = next(get_db())
    
    try:
        # Create agent session
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
        
        # Start the agent session
        await session.start(
            room=ctx.room,
            agent=ServiceAgent(ctx, db),
            room_input_options=RoomInputOptions(
                noise_cancellation=noise_cancellation.BVCTelephony()
            ),
        )
        
        # Generate initial reply
        await session.generate_reply(
            instructions="Greet the customer with name and wait for his response to start survey."
        )
        
    except Exception as e:
        logger.error(f"Error in entrypoint: {str(e)}")
        raise
    finally:
        db.close()

# Launch the worker process
if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))