# VAPI Implementation Details

This document provides specific implementation details for handling VAPI webhook events in the AutoPulse system, focusing on database updates and payload processing.

## 1. Status Update Processing

### 1.1. Status Mapping

VAPI sends status updates with various status values that need to be mapped to our system's statuses.

| VAPI Status | AutoPulse Status |
| ----------- | ---------------- |
| queued      | Ready            |
| ringing     | Ringing          |
| in-progress | In Progress      |
| completed   | Completed        |
| failed      | Failed           |
| no-answer   | Missed           |
| busy        | Missed           |

### 1.2. Status Update Implementation

```python
# server/app/services/webhook_service.py

async def process_call_status(
    self,
    data: Dict[str, Any],
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Process call status updates from VAPI.
    """
    try:
        # Extract call_id from webhook data
        call_id = self.extract_call_id(data)

        if not call_id:
            logger.warning("No call_id found in webhook data")
            return {"status": "error", "message": "No call_id found"}

        # Extract status from webhook data
        if "message" in data and isinstance(data["message"], dict):
            vapi_status = data["message"].get("status")
            if not vapi_status:
                vapi_status = data["message"].get("call", {}).get("status")
        else:
            vapi_status = data.get("status")

        if not vapi_status:
            return {"status": "error", "message": "No status found in webhook data"}

        # Map VAPI status to our system's status
        status_mapping = {
            "queued": "Ready",
            "ringing": "Ringing",
            "in-progress": "In Progress",
            "completed": "Completed",
            "failed": "Failed",
            "no-answer": "Missed",
            "busy": "Missed"
        }

        our_status = status_mapping.get(vapi_status.lower(), "In Progress")

        # Get call from database
        call_query = select(Call).where(Call.id == call_id)
        result = await db.execute(call_query)
        call = result.scalar_one_or_none()

        if not call:
            logger.warning(f"Call with ID {call_id} not found")
            return {"status": "error", "message": f"Call with ID {call_id} not found"}

        # Update call status
        call.status = our_status

        # If call is In Progress and start_time is not set, set it
        if our_status == "In Progress" and not call.start_time:
            call.start_time = datetime.utcnow()

        # If call is Completed or Failed and end_time is not set, set it
        if our_status in ["Completed", "Failed"] and not call.end_time:
            call.end_time = datetime.utcnow()

            # Calculate call duration if both start_time and end_time are set
            if call.start_time:
                duration = (call.end_time - call.start_time).total_seconds()
                call.duration_sec = int(duration)

        # Update service record status if available
        if call.service_record_id:
            service_query = select(ServiceRecord).where(ServiceRecord.id == call.service_record_id)
            service_result = await db.execute(service_query)
            service_record = service_result.scalar_one_or_none()

            if service_record:
                service_record.status = our_status

        # Commit the changes
        await db.commit()

        return {
            "status": "success",
            "message": f"Call status updated to {our_status}",
            "call_id": call_id
        }

    except Exception as e:
        logger.error(f"Error processing call status update: {str(e)}")
        return {"status": "error", "message": str(e)}
```

## 2. Call Hangup Processing

### 2.1. Hangup Handler Implementation

```python
# server/app/services/webhook_service.py

async def process_hangup(
    self,
    data: Dict[str, Any],
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Process call hangup events from VAPI.
    """
    try:
        # Extract call_id from webhook data
        call_id = self.extract_call_id(data)

        if not call_id:
            logger.warning("No call_id found in webhook data")
            return {"status": "error", "message": "No call_id found"}

        # Get call from database
        call_query = select(Call).where(Call.id == call_id)
        result = await db.execute(call_query)
        call = result.scalar_one_or_none()

        if not call:
            logger.warning(f"Call with ID {call_id} not found")
            return {"status": "error", "message": f"Call with ID {call_id} not found"}

        # Extract reason from webhook data
        if "message" in data and isinstance(data["message"], dict):
            reason = data["message"].get("reason")
        else:
            reason = data.get("reason")

        # Determine status based on reason
        status = "Failed"
        if reason == "user_initiated" or reason == "system_initiated":
            # These are normal hangups, so might not be failures
            # Check if the call was completed
            if call.status == "Completed":
                status = "Completed"

        # Update call status
        call.status = status

        # If end_time is not set, set it
        if not call.end_time:
            call.end_time = datetime.utcnow()

            # Calculate call duration if start_time is set
            if call.start_time:
                duration = (call.end_time - call.start_time).total_seconds()
                call.duration_sec = int(duration)

        # Update service record status if available
        if call.service_record_id:
            service_query = select(ServiceRecord).where(ServiceRecord.id == call.service_record_id)
            service_result = await db.execute(service_query)
            service_record = service_result.scalar_one_or_none()

            if service_record:
                service_record.status = status

        # Log the hangup reason
        logger.info(f"Call {call_id} hung up with reason: {reason}")

        # Commit the changes
        await db.commit()

        return {
            "status": "success",
            "message": f"Call status updated to {status} after hangup",
            "call_id": call_id
        }

    except Exception as e:
        logger.error(f"Error processing call hangup: {str(e)}")
        return {"status": "error", "message": str(e)}
```

## 3. End-of-Call Report Processing

### 3.1. Database Schema Updates

First, we need to update our database schema to accommodate the additional fields:

```python
# server/app/models/call.py

# Add these fields to the Call model
class Call(Base):
    # Existing fields...

    # New fields for VAPI integration
    vapi_call_id = Column(String(100), nullable=True)  # VAPI's call ID
    ended_reason = Column(String(50), nullable=True)  # Reason for call ending
    cost = Column(Numeric(10, 4), nullable=True)  # Cost of the call
    duration_ms = Column(Integer, nullable=True)  # Duration in milliseconds
```

```python
# server/app/models/transcript.py

# Update Transcript model to include additional fields
class Transcript(Base):
    # Existing fields...

    # Additional fields from VAPI
    seconds_from_start = Column(Float, nullable=True)  # Seconds from call start
    duration = Column(Integer, nullable=True)  # Duration of this message in ms
    end_time = Column(DateTime(timezone=True), nullable=True)  # End time of this message
```

### 3.2. End-of-Call Report Implementation

```python
# server/app/services/webhook_service.py

async def process_call_report(
    self,
    data: Dict[str, Any],
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Process end-of-call report data from VAPI.
    """
    try:
        # Extract call_id from webhook data
        call_id = self.extract_call_id(data)

        if not call_id:
            logger.warning("No call_id found in webhook data")
            return {"status": "error", "message": "No call_id found"}

        # Get call from database
        call_query = select(Call).where(Call.id == call_id)
        result = await db.execute(call_query)
        call = result.scalar_one_or_none()

        if not call:
            logger.warning(f"Call with ID {call_id} not found")
            return {"status": "error", "message": f"Call with ID {call_id} not found"}

        # Get service record
        if call.service_record_id:
            service_query = select(ServiceRecord).where(ServiceRecord.id == call.service_record_id)
            service_result = await db.execute(service_query)
            service_record = service_result.scalar_one_or_none()
        else:
            service_record = None

        # Extract data from webhook
        message_data = data.get("message", {})

        # Update call status
        call.status = "Completed"

        # Extract timestamps
        started_at = message_data.get("startedAt")
        ended_at = message_data.get("endedAt")

        if started_at:
            call.start_time = datetime.fromisoformat(started_at.replace("Z", "+00:00"))

        if ended_at:
            call.end_time = datetime.fromisoformat(ended_at.replace("Z", "+00:00"))

        # Extract other fields
        call.ended_reason = message_data.get("endedReason")
        call.cost = message_data.get("cost")
        call.duration_ms = message_data.get("durationMs")

        # Use durationSeconds if available
        if message_data.get("durationSeconds"):
            call.duration_sec = message_data.get("durationSeconds")
        # Calculate duration if not explicitly provided
        elif call.start_time and call.end_time:
            call.duration_sec = int((call.end_time - call.start_time).total_seconds())

        # Extract VAPI call ID
        if "call" in message_data and isinstance(message_data["call"], dict):
            call.vapi_call_id = message_data["call"].get("id")

        # Extract recording URL
        artifact = message_data.get("artifact", {})
        recording_url = artifact.get("recordingUrl")

        if recording_url:
            call.recording_url = recording_url

        # Extract and save transcript messages
        messages = []
        if "messages" in message_data:
            messages = message_data.get("messages", [])
        elif "artifact" in message_data and "messages" in message_data["artifact"]:
            messages = message_data["artifact"].get("messages", [])

        if messages:
            await self.save_transcripts(call_id, messages, db)

        # Update service record status
        if service_record:
            service_record.status = "Completed"

        # Commit all changes
        await db.commit()

        return {
            "status": "success",
            "message": "Call report processed successfully",
            "call_id": call_id
        }

    except Exception as e:
        await db.rollback()
        logger.error(f"Error processing call report: {str(e)}")
        return {"status": "error", "message": str(e)}
```

### 3.3. Transcript Saving Implementation

```python
# server/app/services/webhook_service.py

async def save_transcripts(
    self,
    call_id: int,
    messages: List[Dict[str, Any]],
    db: AsyncSession
) -> None:
    """
    Save transcript messages to the database.
    """
    try:
        transcripts = []

        for idx, message in enumerate(messages):
            if message.get("role") in ["system"]:
                # Skip system messages
                continue

            role = message.get("role", "")

            # Map VAPI roles to our roles
            role_mapping = {
user                "user": "human",
                "assistant": "assistant",
                "bot": "assistant",
                "tool_calls": "tool",
                "tool_call_result": "tool_result"
            }

            mapped_role = role_mapping.get(role, role)

            # Get message content
            content = message.get("message", message.get("content", ""))

            # Extract timestamp
            timestamp = None
            if "time" in message:
                # Convert milliseconds to datetime
                timestamp = datetime.fromtimestamp(int(message["time"]) / 1000, tz=pytz.UTC)
            else:
                # Use current time if not available
                timestamp = datetime.now(pytz.UTC)

            # Create transcript record
            transcript = Transcript(
                call_id=call_id,
                role=mapped_role,
                content=content,
                timestamp=timestamp,
                seconds_from_start=message.get("secondsFromStart"),
                duration=message.get("duration"),
                end_time=None  # Initialize to None
            )

            # Set end_time if available
            if "endTime" in message:
                transcript.end_time = datetime.fromtimestamp(int(message["endTime"]) / 1000, tz=pytz.UTC)

            transcripts.append(transcript)

        # Add all transcripts to the database
        if transcripts:
            db.add_all(transcripts)
            await db.flush()

    except Exception as e:
        logger.error(f"Error saving transcripts: {str(e)}")
        raise
```

## 4. Database Model Updates

### 4.1. Call Model Updates

```python
# server/alembic/versions/xxxx_update_call_model.py

"""Update Call model

Revision ID: xxxx
Revises: [previous_revision]
Create Date: [date]
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'xxxx'
down_revision = '[previous_revision]'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to Call table
    op.add_column('call', sa.Column('vapi_call_id', sa.String(100), nullable=True))
    op.add_column('call', sa.Column('ended_reason', sa.String(50), nullable=True))
    op.add_column('call', sa.Column('cost', sa.Numeric(10, 4), nullable=True))
    op.add_column('call', sa.Column('duration_ms', sa.Integer(), nullable=True))

    # Remove is_demo column from Call table
    op.drop_column('call', 'is_demo')


def downgrade():
    # Restore is_demo column
    op.add_column('call', sa.Column('is_demo', sa.Boolean(), nullable=False, server_default='false'))

    # Remove new columns
    op.drop_column('call', 'duration_ms')
    op.drop_column('call', 'cost')
    op.drop_column('call', 'ended_reason')
    op.drop_column('call', 'vapi_call_id')
```

### 4.2. ServiceRecord Model Updates

```python
# server/alembic/versions/xxxx_update_service_record_model.py

"""Update ServiceRecord model

Revision ID: xxxx
Revises: [previous_revision]
Create Date: [date]
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'xxxx'
down_revision = '[previous_revision]'
branch_labels = None
depends_on = None


def upgrade():
    # Remove columns from ServiceRecord table
    op.drop_column('service_record', 'feedback')
    op.drop_column('service_record', 'rating')
    op.drop_column('service_record', 'service_advisor_id')
    op.drop_column('service_record', 'is_demo')


def downgrade():
    # Restore removed columns
    op.add_column('service_record', sa.Column('is_demo', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('service_record', sa.Column('service_advisor_id', sa.Integer(), nullable=True))
    op.add_column('service_record', sa.Column('rating', sa.SmallInteger(), nullable=True))
    op.add_column('service_record', sa.Column('feedback', sa.Text(), nullable=True))

    # Restore foreign key constraint
    op.create_foreign_key(None, 'service_record', 'user', ['service_advisor_id'], ['id'])
```

### 4.3. Transcript Model Updates

```python
# server/alembic/versions/xxxx_update_transcript_model.py

"""Update Transcript model

Revision ID: xxxx
Revises: [previous_revision]
Create Date: [date]
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'xxxx'
down_revision = '[previous_revision]'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to Transcript table
    op.add_column('transcript', sa.Column('seconds_from_start', sa.Float(), nullable=True))
    op.add_column('transcript', sa.Column('duration', sa.Integer(), nullable=True))
    op.add_column('transcript', sa.Column('end_time', sa.DateTime(timezone=True), nullable=True))


def downgrade():
    # Remove new columns
    op.drop_column('transcript', 'end_time')
    op.drop_column('transcript', 'duration')
    op.drop_column('transcript', 'seconds_from_start')
```

## 5. Testing and Verification

### 5.1. Status Update Testing

1. Generate a mock status update webhook payload
2. Send it to the webhook endpoint
3. Verify that the call status is updated correctly in the database

```python
# Example mock status update payload
status_update_payload = {
    "message": {
        "type": "status-update",
        "status": "in-progress",
        "call": {
            "id": "6896cc2a-4989-48bd-8e24-d64dd2781d4b",
            "status": "in_progress",
            "assistantOverrides": {
                "variableValues": {
                    "call_id": "15"
                }
            }
        }
    }
}
```

### 5.2. End-of-Call Report Testing

1. Generate a mock end-of-call report webhook payload
2. Send it to the webhook endpoint
3. Verify that:
   - The call status is updated to "Completed"
   - The transcript records are created with the correct fields
   - The recording URL is stored correctly
   - Other fields (cost, duration, etc.) are updated

## 6. Deployment and Monitoring

1. Deploy the database migration scripts
2. Deploy the updated webhook service
3. Monitor the logs for any errors
4. Set up alerting for webhook processing failures
5. Implement a retry mechanism for failed webhook processing
