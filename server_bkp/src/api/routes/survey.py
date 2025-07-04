from fastapi import APIRouter, HTTPException
import time
import logging
from ...services.livekit_service import livekit_service

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/start/{customer_id}")
async def start_survey(customer_id: int):
    """
    Start a survey call with a customer.
    FastAPI's role is to tell LiveKit to dial a customer when someone clicks Initiate Survey.
    The heavy lifting (SIP invite, media relay, STT, LLM, TTS) is handled by LiveKit + the agent worker.
    """
    try:
        # Mock customer data for testing
        mock_customer = {
            "id": customer_id,
            "name": "Test Customer",
            "phone_number": "+19029897685"  # Replace with your test phone number
        }
        
        # Create a unique LiveKit room name
        room_name = f"survey-{customer_id}-{int(time.time())}"
        
        logger.info(f"Attempting to create SIP call for customer {customer_id} in room {room_name}")
        
        # Initiate SIP call via LiveKit
        sip_info = await livekit_service.create_sip_call(
            room_name=room_name,
            phone_number=mock_customer["phone_number"],
            customer_id=str(mock_customer["id"]),
            customer_name=mock_customer["name"]
        )
        
        logger.info(f"Successfully created SIP call: {sip_info}")
        
        return {
            "status": "initiated", 
            "call_sid": sip_info.call_sid,
            "customer": mock_customer,
            "room_name": room_name
        }
        
    except Exception as e:
        logger.error(f"Error creating SIP call: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Call failed: {str(e)}"
        )
