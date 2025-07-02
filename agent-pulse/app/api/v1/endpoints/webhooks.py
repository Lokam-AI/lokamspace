from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
import json

from app.core.database import get_db
from app.core.logging import get_logger
from app.dependencies import verify_vapi_secret
from app.models.schemas import WebhookResponse
from app.services.webhook_service import WebhookService
from app.config import get_settings

logger = get_logger(__name__)
settings = get_settings()
router = APIRouter()

@router.get("/vapi-webhook/test")
async def test_webhook():
    """Test endpoint to verify webhook accessibility."""
    return {"message": "Webhook endpoint is accessible", "status": "ok"}

@router.post(settings.WEBHOOK_ENDPOINT, response_model=WebhookResponse)
async def vapi_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(verify_vapi_secret)
):
    """
    VAPI webhook endpoint to receive call events and end-of-call reports.
    """
    try:
        logger.info("Received webhook request")
        
        # Parse the JSON body
        body_json = await request.json()
        logger.info(f"Webhook payload received: {json.dumps(body_json, indent=2)}")
        
        # Extract the message from the webhook payload
        message = body_json.get("message", {})
        event_type = message.get("type")
        
        logger.info(f"Processing event type: {event_type}")
        
        if event_type == "end-of-call-report":
            try:
                # Process the webhook data
                webhook_service = WebhookService()
                result = await webhook_service.process_webhook_data(message, db)
                logger.info(f"Call report processed: {result}")
                
                if result.get("database_updated"):
                    return WebhookResponse(
                        status="success",
                        message="Call report processed, saved, and database updated successfully",
                        file_path=result.get("file_path"),
                        db_message=result.get("db_message")
                    )
                else:
                    return WebhookResponse(
                        status="success",
                        message="Call report saved but database update failed",
                        file_path=result.get("file_path"),
                        db_error=result.get("db_error")
                    )
                    
            except Exception as e:
                logger.error(f"Error processing call report: {str(e)}")
                # Don't raise the error, just log it and return success to VAPI
                # This prevents VAPI from retrying the webhook
                return WebhookResponse(
                    status="success",
                    message="Call data received but not processed due to error"
                )
        else:
            logger.info(f"Received event type: {event_type}")
            return WebhookResponse(
                status="success",
                message=f"Event type {event_type} received and acknowledged"
            )
            
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 