import logging
import uuid
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import asyncio
from sqlalchemy import select

from src.db.database import get_db, init_db
from src.db.models import CallInteraction, ServiceRecord
from src.telephony.telephony_service import TelephonyService
from src.agent.agent_service import AgentService

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api")

# Initialize FastAPI app
app = FastAPI(
    title="GarageBot Service",
    description="A microservice for automated car service feedback collection",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
telephony_service = TelephonyService()

# Request/Response models
class FeedbackRequest(BaseModel):
    phone_number: str = Field(
        pattern=r'^\+?1?\d{10,15}$',
        description="Phone number in E.164 format",
        examples=["+12345678901"]
    )
    service_record_id: str = Field(
        description="Service record identifier",
        examples=["service_123"]
    )

    class Config:
        json_schema_extra = {
            "example": {
                "phone_number": "+12345678901",
                "service_record_id": "service_123"
            }
        }

class FeedbackResponse(BaseModel):
    session_id: str
    status: str
    message: str

    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "123e4567-e89b-12d3-a456-426614174000",
                "status": "initiated",
                "message": "Feedback call has been scheduled"
            }
        }

class FeedbackStatus(BaseModel):
    session_id: str
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[float] = None

    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "123e4567-e89b-12d3-a456-426614174000",
                "status": "completed",
                "start_time": "2024-03-21T10:00:00Z",
                "end_time": "2024-03-21T10:05:00Z",
                "duration": 300.0
            }
        }

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    # await init_db()

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    await telephony_service.close()

@app.post("/feedback/start", response_model=FeedbackResponse)
async def start_feedback(
    request: FeedbackRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Start a feedback collection call"""
    try:
        # Validate service record exists
        # service_record = await db.execute(
        #     select(ServiceRecord).where(ServiceRecord.id == request.service_record_id)
        # )
        # service_record = service_record.scalar_one_or_none()
        
        # if not service_record:
        #     raise HTTPException(
        #         status_code=404,
        #         detail=f"Service record {request.service_record_id} not found"
        #     )
        
        # Check for existing active call
        # active_call = await db.execute(
        #     select(CallInteraction).where(
        #         CallInteraction.service_id == request.service_record_id,
        #         CallInteraction.status.in_(["initialized", "in_progress", "connected"])
        #     )
        # )
        # active_call = active_call.scalar_one_or_none()
        
        # if active_call:
        #     raise HTTPException(
        #         status_code=409,
        #         detail=f"Active call already exists for service record {request.service_record_id}"
        #     )
        
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        
        # Schedule the feedback call as a background task
        background_tasks.add_task(
            handle_feedback_call,
            request.phone_number,
            request.service_record_id,
            session_id,
            db
        )
        
        return FeedbackResponse(
            session_id=session_id,
            status="initiated",
            message="Feedback call has been scheduled"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting feedback: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to start feedback call"
        )

@app.get("/feedback/{session_id}/status", response_model=FeedbackStatus)
async def get_feedback_status(session_id: str, db: Session = Depends(get_db)):
    """Get the status of a feedback call"""
    # result = await db.execute(
    #     select(CallInteraction).where(CallInteraction.session_id == session_id)
    # )
    # call_record = result.scalar_one_or_none()
    
    # if not call_record:
    #     raise HTTPException(
    #         status_code=404,
    #         detail="Feedback session not found"
    #     )
    
    # Temporary mock response
    return FeedbackStatus(
        session_id=session_id,
        status="in_progress",
        start_time=datetime.utcnow(),
        end_time=None,
        duration=None
    )

async def handle_feedback_call(
    phone_number: str,
    service_record_id: str,
    session_id: str,
    db: Session
):
    """Background task to handle the feedback call process"""
    try:
        # Initialize telephony service
        telephony_service = TelephonyService()
        
        # Create call record
        call_record = CallInteraction(
            service_id=service_record_id,
            session_id=session_id,
            call_started=datetime.utcnow(),
            status="initialized",
            metrics={}  # Initialize empty JSON metrics
        )
        # db.add(call_record)
        # await db.commit()
        
        logger.info(f"Starting feedback call for session {session_id}")
        
        # Start the call and get room name
        room_name = await telephony_service.start_call(phone_number, session_id)
        
        if not room_name:
            logger.error(f"Failed to start call for session {session_id}")
            # call_record.status = "failed"
            # call_record.summary = "Failed to establish call"
            # await db.commit()
            return
            
        if room_name in ["not_answered", "busy", "invalid_number"]:
            # call_record.status = "failed"
            # call_record.summary = f"Call failed: {room_name}"
            # call_record.disconnect_reason = room_name
            # await db.commit()
            return
        
        logger.info(f"Call connected in room {room_name}")
        # call_record.status = "connected"
        # await db.commit()
        
        # Start the agent
        agent_service = AgentService(db)
        await agent_service.start_agent(room_name, call_record)
        
        # Monitor call status
        while True:
            call_status = await telephony_service.get_call_status(room_name)
            if not call_status:
                break
            await asyncio.sleep(1)
        
        # End call and cleanup
        await telephony_service.end_call(room_name)
        
        # if call_record.status not in ["completed", "voicemail"]:
        #     call_record.status = "disconnected"
        #     call_record.call_ended = datetime.utcnow()
        #     await db.commit()

    except Exception as e:
        logger.error(f"Error in feedback call: {str(e)}")
        # if 'call_record' in locals():
        #     call_record.status = "failed"
        #     call_record.summary = f"Error: {str(e)}"
        #     await db.commit()
        # Cleanup if room was created
        if 'room_name' in locals() and 'telephony_service' in locals():
            await telephony_service.end_call(room_name)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 