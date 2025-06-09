from fastapi import APIRouter, HTTPException, Depends
import time
import logging
from ...services.livekit_service import livekit_service
from sqlalchemy.orm import Session
from ...db.base import Customer, ServiceRecord, CallInteraction
from ...db.session import get_db
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/start/{customer_id}/{service_record_id}")
async def start_survey(
    customer_id: int,
    service_record_id: int,
    db: Session = Depends(get_db)
):
    """
    Start a survey call with a customer.
    FastAPI's role is to tell LiveKit to dial a customer when someone clicks Initiate Survey.
    The heavy lifting (SIP invite, media relay, STT, LLM, TTS) is handled by LiveKit + the agent worker.
    """
    try:
        # Get customer and service record from database
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        service_record = db.query(ServiceRecord).filter(ServiceRecord.id == service_record_id).first()
        
        if not customer or not service_record:
            raise HTTPException(
                status_code=404,
                detail="Customer or service record not found"
            )
        
        # Check if there's already an in-progress call
        existing_call = db.query(CallInteraction).filter(
            CallInteraction.service_record_id == service_record_id,
            CallInteraction.status == "in-progress"
        ).first()
        
        if existing_call:
            raise HTTPException(
                status_code=400,
                detail="There is already an active survey call for this service record"
            )
        
        # Create a unique LiveKit room name with both IDs
        room_name = f"survey-c{customer_id}-s{service_record_id}-{int(time.time())}"
        
        logger.info(f"Attempting to create SIP call for customer {customer_id} with service record {service_record_id} in room {room_name}")
        
        try:
            # Create a new call interaction record
            call_interaction = CallInteraction(
                service_record_id=service_record_id,
                call_date=datetime.utcnow(),
                status="in-progress",
                transcription="Call initiated"
            )
            db.add(call_interaction)
            db.flush()  # Get the ID without committing
            
            # Update service record status and associate with call interaction
            service_record.status = "in_progress"
            service_record.call_interactions.append(call_interaction)
            
            # Initiate SIP call via LiveKit with additional metadata
            sip_info = await livekit_service.create_sip_call(
                room_name=room_name,
                phone_number=customer.phone,
                customer_id=str(customer.id),
                customer_name=customer.name,
                metadata={
                    "service_record_id": service_record_id,
                    "vehicle_number": service_record.vehicle_number,
                    "service_date": service_record.service_date.isoformat(),
                    "call_interaction_id": call_interaction.id
                }
            )
            
            logger.info(f"Successfully created SIP call: {sip_info}")
            
            # Commit all database changes
            db.commit()
            
            return {
                "status": "initiated", 
                "call_id": sip_info.sip_call_id,
                "call_interaction_id": call_interaction.id,
                "customer": {
                    "id": customer.id,
                    "name": customer.name,
                    "phone": customer.phone
                },
                "service_record": {
                    "id": service_record.id,
                    "vehicle_number": service_record.vehicle_number,
                    "service_date": service_record.service_date,
                    "status": service_record.status
                },
                "room_name": room_name
            }
            
        except Exception as e:
            # If SIP call creation fails, update both records to failed status
            if 'call_interaction' in locals():
                call_interaction.status = "failed"
                service_record.status = "failed"
                db.commit()
            raise e
            
    except Exception as e:
        logger.error(f"Error creating SIP call: {str(e)}", exc_info=True)
        # Rollback any database changes if there was an error
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Call failed: {str(e)}"
        )
