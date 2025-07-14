"""
API endpoints for handling webhooks.
"""

from typing import Any, Dict
import json
import logging
import os
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, Depends, Request, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_tenant_db, verify_vapi_secret
from app.services.webhook_service import WebhookService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/vapi-webhook")
async def vapi_webhook(
    request: Request,
    db: AsyncSession = Depends(get_tenant_db),
    _: str = Depends(verify_vapi_secret)
) -> Any:
    """
    VAPI webhook endpoint to receive call events and end-of-call reports.

    Args:
        request: HTTP request
        db: Database session
        _: Verified VAPI secret token

    Returns:
        WebhookResponse: Processing result
    """
    try:
        logger.info("Received webhook request")

        # Parse request body
        body_json = await request.json()
        logger.info(f"Webhook payload received: {json.dumps(body_json, indent=2)}")

        # Extract the message from the webhook payload
        # For status-update events, the structure is { "message": { "type": "status-update", ... } }
        # For end-of-call-report events, the structure is { "message": { "type": "end-of-call-report", ... } }
        if "message" in body_json:
            message = body_json["message"]
            message_type = message.get("type")
            
            # Log the event type
            logger.info(f"Processing event type: {message_type}")
        else:
            # If there's no message field, use the body directly
            message = body_json
            message_type = body_json.get("type")
            
            logger.info(f"Processing direct event type: {message_type}")

        # Save the webhook payload to a JSON file for reference
        try:
            # Create guides directory if it doesn't exist
            guides_dir = Path("guides")
            guides_dir.mkdir(exist_ok=True)
            
            # Generate timestamp
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            
            # Create filename based on event type and timestamp
            filename = f"{message_type or 'unknown'}-{timestamp}.json"
            filepath = guides_dir / filename
            
            # Write the payload to the file
            with open(filepath, "w") as f:
                json.dump(body_json, f, indent=2)
                
            logger.info(f"Saved webhook payload to {filepath}")
        except Exception as e:
            logger.error(f"Failed to save webhook payload: {str(e)}")

        # Process the message using the webhook service
        webhook_service = WebhookService()
        result = await webhook_service.process_webhook_data(message, db)
        
        if result.get("status") == "error":
            logger.warning(f"Error processing webhook: {result.get('message')}")
        
        return result
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing webhook: {str(e)}"
        ) 