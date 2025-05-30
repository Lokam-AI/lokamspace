import logging
from fastapi import APIRouter, Depends, HTTPException, Security, UploadFile, File
from fastapi.security.api_key import APIKeyHeader
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.db.db import get_db
from app.schemas import call as call_schema
from app.services.ai_agent import AIAgent
from app.services.telephony_service import TelephonyService
from app.config import get_settings
from io import BytesIO

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter()
api_key_header = APIKeyHeader(name=settings.API_KEY_HEADER)

# Initialize services
ai_agent = AIAgent()
telephony_service = TelephonyService()

async def verify_api_key(api_key: str = Security(api_key_header)) -> None:
    """Verify the API key from the request header."""
    if api_key != settings.API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")

@router.post("/start", response_model=call_schema.CallResponse)
async def initiate_call(
    call_request: call_schema.CallRequest,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
) -> Dict[str, Any]:
    """
    Initiate a new call using the telephony service.
    
    Args:
        call_request: The call request containing phone number
        db: Database session
        _: API key verification dependency
    
    Returns:
        Dict containing call_id and status
    
    Raises:
        HTTPException: If call initiation fails
    """
    logger.info(f"Initiating call to {call_request.phone_number}")
    try:
        call = await telephony_service.start_call(call_request.phone_number)
        logger.info(f"Call initiated successfully with ID: {call['id']}")
        return {"call_id": call["id"], "status": "initiated"}
    except Exception as e:
        logger.error(f"Failed to initiate call: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{call_id}", response_model=call_schema.CallStatus)
async def get_call_status(
    call_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
) -> Dict[str, Any]:
    """
    Get the status of an ongoing call.
    
    Args:
        call_id: The ID of the call to check
        db: Database session
        _: API key verification dependency
    
    Returns:
        Dict containing call status information
    
    Raises:
        HTTPException: If call is not found or status check fails
    """
    logger.info(f"Checking status for call {call_id}")
    try:
        status = await telephony_service.get_call_status(call_id)
        return {"call_id": call_id, "status": status}
    except Exception as e:
        logger.error(f"Failed to get call status: {str(e)}", exc_info=True)
        raise HTTPException(status_code=404, detail="Call not found")

@router.delete("/{call_id}")
async def end_call(
    call_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
) -> Dict[str, str]:
    """
    End an active call.
    
    Args:
        call_id: The ID of the call to end
        db: Database session
        _: API key verification dependency
    
    Returns:
        Dict containing success message
    
    Raises:
        HTTPException: If call ending fails
    """
    logger.info(f"Ending call {call_id}")
    try:
        await telephony_service.end_call(call_id)
        return {"message": "Call ended successfully"}
    except Exception as e:
        logger.error(f"Failed to end call: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{call_id}/transcribe")
async def transcribe_audio(
    call_id: str,
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
) -> Dict[str, Any]:
    """
    Transcribe audio from the call using AI service.
    
    Args:
        call_id: The ID of the call
        audio_file: The audio file to transcribe
        db: Database session
        _: API key verification dependency
    
    Returns:
        Dict containing transcription results
    
    Raises:
        HTTPException: If transcription fails
    """
    logger.info(f"Transcribing audio for call {call_id}")
    try:
        audio_data = await audio_file.read()
        transcription = await ai_agent.transcribe_audio(audio_data)
        return transcription
    except Exception as e:
        logger.error(f"Failed to transcribe audio: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{call_id}/respond")
async def generate_response(
    call_id: str,
    text: str,
    context: Dict[str, Any] = None,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
) -> Dict[str, Any]:
    """
    Generate AI response for the call.
    
    Args:
        call_id: The ID of the call
        text: The text to respond to
        context: Optional context for the response
        db: Database session
        _: API key verification dependency
    
    Returns:
        Dict containing AI response
    
    Raises:
        HTTPException: If response generation fails
    """
    logger.info(f"Generating response for call {call_id}")
    try:
        response = await ai_agent.generate_response(text, context)
        return response
    except Exception as e:
        logger.error(f"Failed to generate response: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{call_id}/synthesize")
async def text_to_speech(
    call_id: str,
    text: str,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
) -> StreamingResponse:
    """
    Convert text to speech for the call.
    
    Args:
        call_id: The ID of the call
        text: The text to convert to speech
        db: Database session
        _: API key verification dependency
    
    Returns:
        StreamingResponse containing audio data
    
    Raises:
        HTTPException: If text-to-speech conversion fails
    """
    logger.info(f"Converting text to speech for call {call_id}")
    try:
        tts_response = await ai_agent.text_to_speech(text)
        audio_data = tts_response["audio_data"]
        
        # Create a BytesIO object from the audio data
        audio_stream = BytesIO(audio_data)
        
        return StreamingResponse(
            audio_stream,
            media_type="audio/mp3",
            headers={
                "Content-Disposition": f'attachment; filename="speech_{call_id}.mp3"'
            }
        )
    except Exception as e:
        logger.error(f"Failed to convert text to speech: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{call_id}/conversation")
async def get_conversation_history(
    call_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
) -> Dict[str, Any]:
    """
    Get the conversation history for a call.
    
    Args:
        call_id: The ID of the call
        db: Database session
        _: API key verification dependency
    
    Returns:
        Dict containing conversation history
    """
    logger.info(f"Retrieving conversation history for call {call_id}")
    try:
        history = ai_agent.get_conversation_history()
        return {"call_id": call_id, "history": history}
    except Exception as e:
        logger.error(f"Failed to get conversation history: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{call_id}/metrics")
async def get_call_metrics(
    call_id: str,
    db: Session = Depends(get_db),
    _: None = Depends(verify_api_key)
) -> Dict[str, Any]:
    """
    Get metrics for a call.
    
    Args:
        call_id: The ID of the call
        db: Database session
        _: API key verification dependency
    
    Returns:
        Dict containing call metrics
    """
    logger.info(f"Retrieving metrics for call {call_id}")
    try:
        metrics = ai_agent.get_metrics()
        return {"call_id": call_id, "metrics": metrics}
    except Exception as e:
        logger.error(f"Failed to get metrics: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) 