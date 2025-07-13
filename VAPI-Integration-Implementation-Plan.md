# VAPI Integration Implementation Plan for AutoPulse

## 1. Overview of VAPI Server Messages

VAPI sends several types of webhook messages that we need to process in our AutoPulse application:

### 1.1. Status Updates (`status-update`)

Status updates are sent during the call to provide real-time information about the call's progress.

**Payload Structure:**

```json
{
  "message": {
    "timestamp": 1752195615957,
    "type": "status-update",
    "status": "in-progress",
    "call": {
      "id": "6896cc2a-4989-48bd-8e24-d64dd2781d4b",
      "status": "queued",
      "assistantId": "89a9fc62-89ee-4a80-ae54-9f0653ae99a8",
      "assistantOverrides": {
        "variableValues": {
          "customer_name": "Rameez",
          "call_id": "15"
        }
      },
      "customer": {
        "number": "+19029897685",
        "name": "Rameez"
      }
    }
  }
}
```

**Processing Required:**

- Extract the call ID from `message.call.assistantOverrides.variableValues.call_id`
- Update call status in the database
- Log the status update for monitoring purposes

### 1.2. Conversation Updates (`conversation-update`)

Conversation updates provide information about the ongoing conversation, including transcripts of what was said.

**Payload Structure:**

```json
{
  "message": {
    "type": "conversation-update",
    "call": {
      "id": "call_123",
      "status": "in_progress"
    },
    "transcript": {
      "speaker": "assistant",
      "text": "Hello, this is the AutoPulse assistant. How can I help you today?"
    }
  }
}
```

**Processing Required:**

- Extract the call ID
- Add the conversation fragment to the transcript table
- Update UI if needed for real-time monitoring

### 1.3. End-of-Call Reports (`end-of-call-report`)

End-of-call reports are sent when a call is completed and contain comprehensive information about the call, including the full transcript, analysis, and any structured data.

**Payload Structure:**

```json
{
  "message": {
    "type": "end-of-call-report",
    "call": {
      "id": "call_123",
      "status": "completed"
    },
    "analysis": {
      "summary": "Customer feedback on recent service",
      "structuredData": {
        "nps_score": "8",
        "overall_feedback": "Customer was mostly satisfied...",
        "detractors": "Wait time was long",
        "positives": "Service was done well",
        "action_items": "Follow up on wait time issue"
      }
    },
    "messages": [
      { "role": "assistant", "content": "Hello, this is..." },
      { "role": "human", "content": "Hi there..." }
    ],
    "artifact": {
      "recordingPath": "https://storage.example.com/recording.mp3"
    }
  }
}
```

**Processing Required:**

- Extract the call ID
- Update call status to "Completed"
- Calculate and store call duration
- Update service record status
- Store the full conversation transcript
- Create a call feedback record with structured data
- Update the recording URL

### 1.4. Call Hangup (`hang`)

Hangup notifications are sent when the call is disconnected.

**Payload Structure:**

```json
{
  "message": {
    "type": "hang",
    "call": {
      "id": "call_123",
      "status": "ended"
    },
    "reason": "user_initiated" // or "system_initiated", "timeout", etc.
  }
}
```

**Processing Required:**

- Extract the call ID
- Update call status to "Ended"
- Update call end time and calculate duration
- Log the hangup reason

### 1.5. Transcript (Final)

Final transcripts may be sent separately or as part of the end-of-call report.

**Processing Required:**

- Extract the call ID
- Store the full conversation transcript in the database
- Ensure proper ordering of messages

## 2. Database Models Overview

### 2.1. Call Model (`Call`)

```python
class Call(Base):
    id = Column(Integer, primary_key=True, autoincrement=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organization.id"), nullable=False)
    service_record_id = Column(Integer, ForeignKey("service_record.id"), nullable=True)
    campaign_id = Column(Integer, ForeignKey("campaign.id"), nullable=True)
    agent_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    customer_number = Column(String(20), nullable=False)
    direction = Column(String(10), nullable=False, default="outbound")
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    duration_sec = Column(Integer)
    status = Column(String(20), nullable=False)
    recording_url = Column(Text)
    nps_score = Column(Integer, nullable=True)
    call_reason = Column(String(100), nullable=True)
    feedback_summary = Column(Text, nullable=True)
    is_demo = Column(Boolean, nullable=False, default=False)
```

### 2.2. CallFeedback Model (`CallFeedback`)

```python
class CallFeedback(Base):
    id = Column(Integer, primary_key=True, autoincrement=True)
    call_id = Column(Integer, ForeignKey("call.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    detractors = Column(Text, nullable=True)
    positives = Column(Text, nullable=True)
    action_items = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### 2.3. Transcript Model (`Transcript`)

```python
class Transcript(Base):
    id = Column(Integer, primary_key=True, autoincrement=True)
    call_id = Column(Integer, ForeignKey("call.id"), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
```

### 2.4. ServiceRecord Model (`ServiceRecord`)

```python
class ServiceRecord(Base):
    id = Column(Integer, primary_key=True, autoincrement=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organization.id"), nullable=False)
    campaign_id = Column(Integer, ForeignKey("campaign.id"), nullable=True)
    customer_name = Column(String(100), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    vehicle_info = Column(String(100))
    service_type = Column(String(50))
    status = Column(String(20), nullable=False, default="Scheduled")
    appointment_date = Column(DateTime(timezone=True))
    service_advisor_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    service_advisor_name = Column(String(100), nullable=True)
    feedback = Column(Text)
    rating = Column(SmallInteger)
    is_demo = Column(Boolean, nullable=False, default=False)
```

## 3. Webhook Processing Implementation

### 3.1. Webhook Endpoint

```python
# server/app/api/v1/endpoints/webhooks.py

@router.post("/vapi-webhook")
async def vapi_webhook(
    request: Request,
    webhook_service: WebhookService = Depends(get_webhook_service),
    db: AsyncSession = Depends(get_db)
):
    """
    Process VAPI webhook events.
    """
    data = await request.json()
    logger.info("Received webhook request")
    logger.debug(f"Webhook payload received: {json.dumps(data)}")

    # Validate webhook signature if applicable
    # TODO: Add signature validation with X-Vapi-Signature header

    result = await webhook_service.process_webhook_data(data, db)
    return result
```

### 3.2. Webhook Service

The `WebhookService` should handle different types of webhook events:

```python
# server/app/services/webhook_service.py

async def process_webhook_data(self, data: Dict[str, Any], db: AsyncSession) -> Dict[str, Any]:
    """Process webhook data from VAPI."""
    try:
        # Extract the message type
        if "message" in data and isinstance(data["message"], dict):
            event_type = data["message"].get("type")
        else:
            event_type = data.get("type")

        if not event_type:
            return {"status": "error", "message": "Missing event type"}

        if event_type == "end-of-call-report":
            return await self.process_call_report(data, db)
        elif event_type in ["call.started", "call.ended", "call.failed", "status-update"]:
            return await self.process_call_status(data, db)
        elif event_type == "conversation-update":
            return await self.process_conversation_update(data, db)
        elif event_type == "hang":
            return await self.process_hangup(data, db)
        else:
            logger.info(f"Received unsupported event type: {event_type}")
            return {"status": "ignored", "message": f"Event type {event_type} not processed"}

    except Exception as e:
        logger.error(f"Error processing webhook data: {str(e)}")
        return {"status": "error", "message": str(e)}
```

## 4. Implementation Plan

### 4.1. Webhook Configuration

1. Update VAPI configuration to send webhooks to our endpoint
2. Configure webhook URL in environment settings: `VAPI_WEBHOOK_URL=/api/v1/webhooks/vapi-webhook`
3. Generate and set webhook secret: `VAPI_WEBHOOK_SECRET=your_webhook_secret_here`
4. Update webhook handling to validate the signature

### 4.2. Enhance WebhookService

1. Implement/improve `process_conversation_update` method for real-time transcript updates
2. Implement/improve `process_hangup` method for call disconnection events
3. Improve call_id extraction logic for all webhook types

### 4.3. Data Storage Enhancements

1. Update the `save_transcripts` method to handle conversation fragments
2. Create sequence tracking for transcript messages
3. Ensure proper handling of timestamps and timezone information
4. Update the `save_call_feedback` method to extract all feedback fields

### 4.4. Event Handling Improvements

1. Add real-time notification support for call status changes
2. Implement retry logic for database operations
3. Add monitoring and metrics for webhook processing
4. Improve error handling and logging

### 4.5. Testing

1. Create mock webhook payloads for different event types
2. Test webhook endpoint with signature validation
3. Verify database updates for each event type
4. Test error handling and recovery

## 5. Next Steps

1. **Review Current Implementation**

   - Analyze existing webhook processing code
   - Identify gaps in event handling
   - Verify database schema compatibility

2. **Enhance Webhook Processing**

   - Implement handling for all event types
   - Improve data extraction and storage
   - Add signature validation

3. **Update Configuration**

   - Configure VAPI assistant with correct webhook URL
   - Set up appropriate environment variables
   - Test connectivity

4. **Implement UI Updates**

   - Add real-time call status updates to frontend
   - Implement transcript viewing in the call detail panel
   - Display feedback analysis in the dashboard

5. **Testing and Deployment**
   - Test with mock webhooks in development
   - Deploy to staging environment
   - Verify end-to-end flow with real calls

## 6. Resources

1. Local guide: `guides/vapi-integration-guide.md`
2. Sample payloads: `guides/status-update-payload.json`, `guides/end-call-payload.json`
3. VAPI API Documentation: https://docs.vapi.ai/api-reference
4. Webhook Processing Service: `server/app/services/webhook_service.py`
