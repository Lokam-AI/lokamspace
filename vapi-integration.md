# VAPI Integration Implementation Plan

This document outlines the step-by-step approach to integrate VAPI webhooks with our server application, based on the existing implementation in the agent-pulse project.

## 1. Overview

VAPI (Voice API) sends webhook events to our backend whenever a call event occurs, including call status updates and end-of-call reports. Our backend needs to:

1. Receive these webhook events
2. Validate they come from a legitimate source
3. Process the data
4. Update our database records
5. Return appropriate responses

## 2. Component Setup

### 2.1. Configuration

First, we need to update our configuration to include VAPI webhook settings:

```python
# In app/core/config.py

# Add these to the Settings class
VAPI_WEBHOOK_SECRET: str = "your_webhook_secret_here"
VAPI_WEBHOOK_PATH: str = "/api/v1/webhooks/vapi"
```

### 2.2. Webhook Endpoint

Create a new endpoint in the server application:

```python
# In app/api/v1/endpoints/webhooks.py

from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
import json
import logging

from app.dependencies import get_tenant_db, verify_vapi_secret
from app.core.config import settings
from app.services.webhook_service import WebhookService

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/vapi/test")
async def test_webhook():
    """Test endpoint to verify webhook accessibility."""
    return {"message": "VAPI webhook endpoint is accessible", "status": "ok"}

@router.post("/vapi", response_model=dict)
async def vapi_webhook(
    request: Request,
    db: AsyncSession = Depends(get_tenant_db),
    _: str = Depends(verify_vapi_secret)
):
    """
    VAPI webhook endpoint to receive call events and end-of-call reports.
    """
    try:
        logger.info("Received VAPI webhook request")

        # Parse the JSON body
        body_json = await request.json()
        logger.info(f"Webhook payload received: {json.dumps(body_json, indent=2)}")

        # Extract the message from the webhook payload
        message = body_json.get("message", {})
        event_type = message.get("type")

        logger.info(f"Processing event type: {event_type}")

        webhook_service = WebhookService()

        if event_type == "end-of-call-report":
            try:
                # Process the end-of-call report
                result = await webhook_service.process_call_report(message, db)

                return {
                    "status": "success",
                    "message": "Call report processed successfully",
                    "details": result
                }

            except Exception as e:
                logger.error(f"Error processing call report: {str(e)}")
                # Return success to prevent VAPI from retrying
                return {
                    "status": "success",
                    "message": "Call report received with processing errors",
                    "error": str(e)
                }
        else:
            # Process other event types (e.g., call status updates)
            try:
                result = await webhook_service.process_call_event(message, db)

                return {
                    "status": "success",
                    "message": f"Event type {event_type} processed successfully",
                    "details": result
                }

            except Exception as e:
                logger.error(f"Error processing event type {event_type}: {str(e)}")
                return {
                    "status": "success",
                    "message": f"Event {event_type} received with processing errors",
                    "error": str(e)
                }

    except Exception as e:
        logger.error(f"Error handling webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
```

### 2.3. Router Setup

Add the webhook router to the API router:

```python
# In app/api/v1/router.py

from app.api.v1.endpoints import webhooks

# Add to existing API router
api_router.include_router(
    webhooks.router,
    prefix="/webhooks",
    tags=["webhooks"]
)
```

### 2.4. Verification Middleware

Create a dependency for verifying the VAPI webhook secret:

```python
# In app/dependencies.py

from fastapi import Header, HTTPException, status
from app.core.config import settings

async def verify_vapi_secret(x_vapi_secret: str = Header(None)):
    """
    Verify the VAPI webhook secret.
    """
    if not x_vapi_secret or x_vapi_secret != settings.VAPI_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid VAPI webhook secret"
        )

    return x_vapi_secret
```

## 3. Webhook Service Implementation

### 3.1. Create WebhookService

Create a service class to process webhook data:

```python
# In app/services/webhook_service.py

import json
import logging
from typing import Dict, Any
from datetime import datetime
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Call, ServiceRecord, Transcript, CallFeedback
from app.core.config import settings

logger = logging.getLogger(__name__)

class WebhookService:
    """Service for handling VAPI webhook events."""

    async def process_call_event(self, event_data: Dict, db: AsyncSession) -> Dict:
        """
        Process call events like status changes.

        Args:
            event_data: Event data from webhook
            db: Database session

        Returns:
            Dict: Processing result
        """
        # Extract event details
        event_type = event_data.get("type")
        status = event_data.get("status")
        call_id = self._extract_call_id(event_data)

        if not call_id:
            logger.warning("No call ID found in event data")
            return {"success": False, "message": "No call ID found in event data"}

        # Update call status based on event type
        if event_type in ["call-started", "call-connected", "call-in-progress"]:
            await self._update_call_status(db, call_id, "In Progress")
        elif event_type == "call-ended" or status == "completed":
            end_reason = event_data.get("endedReason", "Unknown")
            if end_reason == "completed":
                await self._update_call_status(db, call_id, "Completed")
            elif end_reason in ["failed", "no-answer"]:
                await self._update_call_status(db, call_id, "Failed")
            else:
                await self._update_call_status(db, call_id, "Completed")

        return {"success": True, "call_id": call_id, "event_type": event_type}

    async def process_call_report(self, report_data: Dict, db: AsyncSession) -> Dict:
        """
        Process end-of-call report with transcripts and feedback.

        Args:
            report_data: Call report data
            db: Database session

        Returns:
            Dict: Processing result
        """
        # Extract call ID
        call_id = self._extract_call_id(report_data)

        if not call_id:
            logger.warning("No call ID found in report data")
            return {"success": False, "message": "No call ID found in report data"}

        # Get call record
        query = select(Call).where(Call.id == call_id)
        result = await db.execute(query)
        call = result.scalar_one_or_none()

        if not call:
            logger.warning(f"Call ID {call_id} not found in database")
            return {"success": False, "message": f"Call ID {call_id} not found"}

        # Get service record
        service_query = select(ServiceRecord).where(ServiceRecord.id == call.service_record_id)
        service_result = await db.execute(service_query)
        service_record = service_result.scalar_one_or_none()

        # Process different parts of the report
        results = {}

        # 1. Update call status and completion data
        call_update_result = await self._update_call_completion(db, call, report_data)
        results["call_update"] = call_update_result

        # 2. Process transcripts
        transcript_result = await self._process_transcripts(db, call_id, report_data)
        results["transcripts"] = transcript_result

        # 3. Process feedback data
        feedback_result = await self._process_feedback(db, call, service_record, report_data)
        results["feedback"] = feedback_result

        # 4. Process recording/audio link
        recording_result = await self._process_recording(db, call, report_data)
        results["recording"] = recording_result

        return {
            "success": True,
            "call_id": call_id,
            "results": results
        }

    async def _update_call_status(self, db: AsyncSession, call_id: int, status: str) -> Dict:
        """Update call status in the database."""
        try:
            # Update call status
            stmt = update(Call).where(Call.id == call_id).values(status=status)
            await db.execute(stmt)

            # Also update service record status if applicable
            call_query = select(Call).where(Call.id == call_id)
            call_result = await db.execute(call_query)
            call = call_result.scalar_one_or_none()

            if call and call.service_record_id:
                service_stmt = update(ServiceRecord).where(
                    ServiceRecord.id == call.service_record_id
                ).values(status=status)
                await db.execute(service_stmt)

            await db.commit()
            return {"success": True, "status": status}
        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating call status: {str(e)}")
            return {"success": False, "error": str(e)}

    async def _update_call_completion(self, db: AsyncSession, call: Call, report_data: Dict) -> Dict:
        """Update call with completion data."""
        try:
            # Extract data from report
            end_time = self._parse_datetime(report_data.get("endedAt"))
            started_at = self._parse_datetime(report_data.get("startedAt"))
            ended_reason = report_data.get("endedReason")

            # Calculate duration
            duration_sec = None
            if started_at and end_time:
                duration_sec = int((end_time - started_at).total_seconds())

            # Get cost if available
            cost = report_data.get("cost")

            # Update call record
            call.status = "Completed" if ended_reason == "completed" else "Failed"
            call.end_time = end_time
            call.call_ended_at = end_time
            call.duration_sec = duration_sec
            call.cost = cost

            # Also update service record
            if call.service_record_id:
                service_query = select(ServiceRecord).where(ServiceRecord.id == call.service_record_id)
                service_result = await db.execute(service_query)
                service_record = service_result.scalar_one_or_none()

                if service_record:
                    service_record.status = call.status
                    service_record.duration_sec = duration_sec

            await db.commit()
            return {"success": True}
        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating call completion data: {str(e)}")
            return {"success": False, "error": str(e)}

    async def _process_transcripts(self, db: AsyncSession, call_id: int, report_data: Dict) -> Dict:
        """Process and store transcript messages."""
        try:
            messages = []
            raw_messages = report_data.get("messages", [])

            if not raw_messages:
                return {"success": True, "message": "No transcript messages found"}

            # Process each message
            for msg in raw_messages:
                if not msg.get("role") or not msg.get("message"):
                    continue

                # Create a transcript record
                transcript = Transcript(
                    call_id=call_id,
                    role=msg.get("role"),
                    message=msg.get("message"),
                    time=msg.get("time", 0),
                    end_time=msg.get("endTime", 0),
                    duration=msg.get("duration", 0)
                )

                db.add(transcript)
                messages.append({"role": msg.get("role"), "message": msg.get("message")})

            await db.commit()
            return {"success": True, "message_count": len(messages)}
        except Exception as e:
            await db.rollback()
            logger.error(f"Error processing transcripts: {str(e)}")
            return {"success": False, "error": str(e)}

    async def _process_feedback(self, db: AsyncSession, call: Call, service_record: ServiceRecord, report_data: Dict) -> Dict:
        """Process feedback from the call report."""
        try:
            # Extract feedback data from analysis
            analysis = report_data.get("analysis", {})
            feedback_data = {}

            # Extract summary if available
            summary = analysis.get("summary")
            if summary:
                feedback_data["summary"] = summary

                # If service record exists, update its summary
                if service_record:
                    service_record.summary = summary

            # Extract structured data (NPS score, etc.)
            structured_data = analysis.get("structuredData", {})
            nps_score = structured_data.get("nps_score")
            overall_feedback = structured_data.get("overall_feedback")
            detractors = structured_data.get("detractors")
            positives = structured_data.get("positives")
            action_items = structured_data.get("action_items")

            # Update service record if available
            if service_record and nps_score is not None:
                service_record.nps_score = nps_score
                service_record.overall_feedback = overall_feedback

            # Create feedback record
            if any([overall_feedback, detractors, positives, action_items]):
                feedback = CallFeedback(
                    call_id=call.id,
                    content=overall_feedback or "",
                    detractos=detractors or "",
                    positives=positives or "",
                    action_items=action_items or ""
                )
                db.add(feedback)

            await db.commit()
            return {"success": True}
        except Exception as e:
            await db.rollback()
            logger.error(f"Error processing feedback: {str(e)}")
            return {"success": False, "error": str(e)}

    async def _process_recording(self, db: AsyncSession, call: Call, report_data: Dict) -> Dict:
        """Process recording URL from call report."""
        try:
            # Extract recording URL
            artifact = report_data.get("artifact", {})
            recording_path = artifact.get("recordingPath")

            if not recording_path:
                return {"success": True, "message": "No recording path found"}

            # Update call record
            call.recording_url = recording_path

            # Update service record if available
            if call.service_record_id:
                service_query = select(ServiceRecord).where(ServiceRecord.id == call.service_record_id)
                service_result = await db.execute(service_query)
                service_record = service_result.scalar_one_or_none()

                if service_record:
                    service_record.recording_url = recording_path

            await db.commit()
            return {"success": True, "recording_url": recording_path}
        except Exception as e:
            await db.rollback()
            logger.error(f"Error processing recording URL: {str(e)}")
            return {"success": False, "error": str(e)}

    def _extract_call_id(self, data: Dict) -> int:
        """Extract call ID from webhook data."""
        # Try different paths to find call ID

        # First check assistantOverrides.variableValues.call_id
        try:
            assistant_overrides = data.get("assistantOverrides", {})
            variable_values = assistant_overrides.get("variableValues", {})
            call_id = variable_values.get("call_id")
            if call_id:
                return int(call_id)
        except Exception:
            pass

        # Then check analysis.structuredData.call_id
        try:
            analysis = data.get("analysis", {})
            structured_data = analysis.get("structuredData", {})
            call_id = structured_data.get("call_id")
            if call_id:
                return int(call_id)
        except Exception:
            pass

        # Finally check analysis.structuredDataMulti for call_id
        try:
            analysis = data.get("analysis", {})
            structured_data_multi = analysis.get("structuredDataMulti", [])
            for item in structured_data_multi:
                call_id = item.get("call_id")
                if call_id:
                    return int(call_id)
        except Exception:
            pass

        return None

    def _parse_datetime(self, timestamp: str) -> datetime:
        """Parse ISO timestamp to datetime."""
        if not timestamp:
            return None

        try:
            return datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        except Exception as e:
            logger.error(f"Error parsing timestamp {timestamp}: {str(e)}")
            return None
```

## 4. Database Models

Make sure the necessary database models exist or are updated:

### 4.1. Transcript Model

```python
# In app/models/transcript.py

from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.base import Base, TimestampMixin

class Transcript(Base, TimestampMixin):
    """Call transcript messages."""

    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("calls.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), nullable=False)  # assistant, user
    message = Column(Text, nullable=False)
    time = Column(Float)  # Start time in seconds from beginning of call
    end_time = Column(Float)  # End time in seconds
    duration = Column(Float)  # Duration in seconds

    call = relationship("Call", back_populates="transcripts")
```

### 4.2. CallFeedback Model

```python
# In app/models/call_feedback.py

from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin

class CallFeedback(Base, TimestampMixin):
    """Feedback analysis from the call."""

    __tablename__ = "call_feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("calls.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text)  # Overall feedback content
    detractos = Column(Text)  # Negative points
    positives = Column(Text)  # Positive points
    action_items = Column(Text)  # Recommended actions

    call = relationship("Call", back_populates="feedback")
```

### 4.3. Update Call Model

Make sure the Call model has these fields:

```python
# In app/models/call.py

recording_url = Column(String(255))
cost = Column(Float)
end_time = Column(DateTime)
call_ended_at = Column(DateTime)  # Duplicate for compatibility
duration_sec = Column(Integer)

# Add this relationship
transcripts = relationship("Transcript", back_populates="call", cascade="all, delete")
feedback = relationship("CallFeedback", back_populates="call", cascade="all, delete")
```

### 4.4. Update ServiceRecord Model

Make sure the ServiceRecord model has these fields:

```python
# In app/models/service_record.py

recording_url = Column(String(255))
nps_score = Column(Float)
overall_feedback = Column(Text)
summary = Column(Text)
duration_sec = Column(Integer)
```

## 5. Migration Steps

### 5.1. Create Alembic Migration

Create a migration file to add the necessary tables and fields:

```bash
alembic revision --autogenerate -m "add_vapi_integration_tables"
```

### 5.2. Run Migration

Apply the migration:

```bash
alembic upgrade head
```

## 6. Testing and Verification

### 6.1. Test Webhook Accessibility

Use curl or Postman to send a GET request to the test endpoint:

```bash
curl http://your-server-url/api/v1/webhooks/vapi/test
```

### 6.2. Test Webhook Processing

1. Set up a local tunnel (e.g., using ngrok) to expose your local webhook endpoint to the internet
2. Configure the webhook URL in VAPI dashboard pointing to your tunnel URL
3. Make a test call using VAPI
4. Verify the webhook receives the call events and updates the database correctly

### 6.3. Verify Database Updates

Check the database after test calls to ensure:

- Calls are marked as completed
- Transcripts are stored correctly
- Feedback data is recorded
- Recording URLs are saved

## 7. Deployment Considerations

### 7.1. Environment Variables

Make sure to set these environment variables in production:

```
VAPI_WEBHOOK_SECRET=your_production_webhook_secret
```

### 7.2. SSL Certificate

Ensure the production endpoint has a valid SSL certificate as VAPI requires HTTPS for webhooks.

### 7.3. Error Handling

Add monitoring for webhook errors and set up alerts for failed webhook processing.

### 7.4. Webhook Reliability

Consider implementing a webhook retry mechanism or a queue system for more robust processing.

## 8. Follow-up Tasks

- Add more detailed logging for webhook events
- Create a dashboard to view call transcripts and feedback
- Implement analytics based on call data
- Set up monitoring for webhook errors
- Document the webhook API for future reference
