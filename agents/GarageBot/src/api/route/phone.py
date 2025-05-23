from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
import os
import sys
# Add the project root directory to Python path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(project_root)
from server.src.db.base import CallInteraction
from server.src.db.base import get_db
import asyncio
import json
from agents.GarageBot.telephony import TelephonyManager
from agents.GarageBot.Agent import CarServiceReviewAgent
from livekit import agents

router = APIRouter()

class PhoneCallRequest(BaseModel):
    phone_number: str

class CallStatus(BaseModel):
    status: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    duration: Optional[float]
    disconnect_reason: Optional[str]

async def process_call(phone_number: str, db: Session):
    """Process the call in the background"""
    # Create a new call record
    call_record = CallInteraction(
        call_started=datetime.utcnow(),
        transcription="",
        summary=""
    )
    db.add(call_record)
    db.commit()
    
    try:
        # Initialize telephony manager
        telephony = TelephonyManager(db)
        
        # Create dispatch and initiate call
        room_name = await telephony.create_dispatch(phone_number, call_record)
        if not room_name:
            raise Exception("Failed to create dispatch")
            
        # Create SIP participant
        result = await telephony.create_sip_participant(room_name, phone_number)
        if result != True:
            raise Exception(f"Failed to create SIP participant: {result}")

        # Initialize and start the agent
        worker_options = agents.WorkerOptions(
            entrypoint_fnc=lambda ctx: start_agent(ctx, db, call_record.id),
            agent_name="CarServiceReviewAgent"
        )
        
        # Start the agent in a background task
        agent_task = asyncio.create_task(agents.cli.run_app(worker_options))
        
        # Wait for the call to complete
        while True:
            # Check if the call is still active
            if room_name not in telephony.active_rooms:
                break
            await asyncio.sleep(1)
            
        # Update call record with final status
        call_record.transcription = "Call transcript will be updated here"
        call_record.summary = "Call summary will be updated here"
        db.commit()
        
    except Exception as e:
        # Update call record with error
        call_record.transcription = f"Error: {str(e)}"
        db.commit()
        raise e
    finally:
        await telephony.close()

async def start_agent(ctx, db: Session, call_id: int):
    """Start the agent with the given context"""
    try:
        # Create and start the agent
        agent = CarServiceReviewAgent(ctx, db)
        session = agents.AgentSession()
        
        # Start the agent session
        await session.start(
            room=ctx.room,
            agent=agent,
            room_input_options=agents.RoomInputOptions()
        )
        
    except Exception as e:
        logger.error(f"Error in agent session: {str(e)}")
        raise

@router.post("/call")
async def initiate_call(request: PhoneCallRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Initiate a call with the given phone number"""
    try:
        # Start the call processing in the background
        background_tasks.add_task(process_call, request.phone_number, db)
        return {
            "message": "Call initiated",
            "status": "processing",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 

@router.get("/call/{call_id}")
async def get_call_status(call_id: int, db: Session = Depends(get_db)):
    """Get the status of a specific call"""
    call = db.query(CallInteraction).filter(CallInteraction.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    # Calculate duration if call has ended
    duration = None
    if call.transcription and call.call_started:
        duration = (datetime.utcnow() - call.call_started).total_seconds()
    
    return {
        "status": "completed" if call.transcription else "in_progress",
        "start_time": call.call_started,
        "end_time": datetime.utcnow() if call.transcription else None,
        "duration": duration,
        "disconnect_reason": None  # You'll need to add this field to your database
    } 