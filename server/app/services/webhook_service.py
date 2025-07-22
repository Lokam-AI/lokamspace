"""
Service for processing VAPI webhook data.
"""

import json
from datetime import datetime
import pytz
from typing import Dict, Any, List, Optional
import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Call, ServiceRecord, Transcript
from app.core.config import settings
from app.services.call_analysis_service import CallAnalysisService

logger = logging.getLogger(__name__)

class WebhookService:
    """Service for processing VAPI webhook data."""
    
    async def process_webhook_data(
        self,
        data: Dict[str, Any],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Process webhook data from VAPI.
        
        Args:
            data: Webhook data from VAPI
            db: Database session
            
        Returns:
            Dict containing processing results
        """
        try:
            # Extract the message type
            event_type = data.get("type")
            
            if not event_type:
                logger.info("No event type found in webhook data")
                return {"status": "error", "message": "Missing event type"}
            
            logger.info(f"Processing webhook event: {event_type}")
            
            if event_type == "end-of-call-report":
                return await self.process_call_report(data, db)
            elif event_type == "status-update":
                return await self.process_status_update(data, db)
            else:
                logger.info(f"Received unsupported event type: {event_type}")
                return {"status": "ignored", "message": f"Event type {event_type} not processed"}
                
        except Exception as e:
            logger.error(f"Error processing webhook data: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def process_status_update(
        self,
        data: Dict[str, Any],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Process status update events from VAPI.
        
        Args:
            data: Webhook data
            db: Database session
            
        Returns:
            Processing result
        """
        try:
            # Extract call_id from message -> call -> assistantOverrides -> variableValues -> call_id
            call_id = None
            if "call" in data and isinstance(data["call"], dict):
                assistant_overrides = data["call"].get("assistantOverrides", {})
                variable_values = assistant_overrides.get("variableValues", {})
                if "call_id" in variable_values:
                    try:
                        call_id = int(variable_values["call_id"])
                        logger.info(f"Found call_id: {call_id}")
                    except (ValueError, TypeError):
                        logger.warning(f"Invalid call_id format: {variable_values['call_id']}")
            
            if not call_id:
                logger.warning("No call_id found in status update data")
                return {"status": "error", "message": "No call_id found"}
                
            # Get call from database
            call_query = select(Call).where(Call.id == call_id)
            result = await db.execute(call_query)
            call = result.scalar_one_or_none()
            
            if not call:
                logger.warning(f"Call with ID {call_id} not found")
                return {"status": "error", "message": f"Call with ID {call_id} not found"}
                
            # Update call status from message -> status
            status = data.get("status")
            
            if not status:
                return {"status": "error", "message": "No status found in webhook data"}
                
            # Map VAPI status to our system's status
            status_mapping = {
                "queued": "Ready",
                "ringing": "Ringing",
                "in-progress": "In Progress",
                "ended": "Completed",
                "failed": "Failed",
                "no-answer": "Missed",
                "busy": "Missed"
            }
            
            our_status = status_mapping.get(status.lower(), "In Progress")
            
            # Update call status
            call.status = our_status
            
            # Commit the changes
            await db.commit()
            
            return {
                "status": "success", 
                "message": f"Call status updated to {our_status}",
                "call_id": call_id
            }
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Error processing status update: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def process_call_report(
        self,
        data: Dict[str, Any],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Process end-of-call report data from VAPI.
        
        Args:
            data: Webhook data
            db: Database session
            
        Returns:
            Processing result
        """
        try:
            # Extract call_id from message -> call -> assistantOverrides -> variableValues -> call_id
            call_id = None
            if "call" in data and isinstance(data["call"], dict):
                assistant_overrides = data["call"].get("assistantOverrides", {})
                variable_values = assistant_overrides.get("variableValues", {})
                if "call_id" in variable_values:
                    try:
                        call_id = int(variable_values["call_id"])
                        logger.info(f"Found call_id: {call_id}")
                    except (ValueError, TypeError):
                        logger.warning(f"Invalid call_id format: {variable_values['call_id']}")
            
            if not call_id:
                logger.warning("No call_id found in end-of-call report data")
                return {"status": "error", "message": "No call_id found"}
                
            # Get call from database
            call_query = select(Call).where(Call.id == call_id)
            result = await db.execute(call_query)
            call = result.scalar_one_or_none()
            
            if not call:
                logger.warning(f"Call with ID {call_id} not found")
                return {"status": "error", "message": f"Call with ID {call_id} not found"}
            
            # Update call with data from the end-of-call report
            
            # Update recording URL from message -> artifact -> recordingUrl
            if "artifact" in data and isinstance(data["artifact"], dict):
                recording_url = data["artifact"].get("recordingUrl")
                if recording_url:
                    call.recording_url = recording_url
            
            # Update timestamps, ended reason, and cost
            call.start_time = datetime.fromisoformat(data.get("startedAt", "").replace("Z", "+00:00")) if data.get("startedAt") else call.start_time
            call.end_time = datetime.fromisoformat(data.get("endedAt", "").replace("Z", "+00:00")) if data.get("endedAt") else call.end_time
            call.ended_reason = data.get("endedReason")
            call.cost = data.get("cost")
            
            # Update duration
            call.duration_ms = data.get("durationMs")
            call.duration_sec = data.get("durationSeconds") or (int((call.end_time - call.start_time).total_seconds()) if call.start_time and call.end_time else None)
            
            # Update status to completed
            call.status = "Completed"
            
            # Extract and save transcript messages from message -> artifact -> messages
            messages = []
            if "artifact" in data and isinstance(data["artifact"], dict):
                messages = data["artifact"].get("messages", [])
            
            if messages:
                await self.save_transcripts(call_id, messages, db)
            
            # Commit all changes
            await db.commit()
            
            # Trigger after-call analysis
            logger.info(f"Triggering after-call analysis for call {call_id}")
            analysis_result = await CallAnalysisService.trigger_after_call_analysis(call_id, db)
            
            # Log the analysis result status
            if analysis_result.get("status") == "success":
                logger.info(f"After-call analysis completed successfully for call {call_id}")
            else:
                logger.warning(f"After-call analysis failed for call {call_id}: {analysis_result.get('message')}")
            
            return {
                "status": "success", 
                "message": "Call report processed successfully",
                "call_id": call_id,
                "analysis": analysis_result
            }
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Error processing call report: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    async def save_transcripts(
        self,
        call_id: int,
        messages: List[Dict[str, Any]],
        db: AsyncSession
    ) -> None:
        """
        Save transcript messages to the database.
        
        Args:
            call_id: Call ID
            messages: List of message objects
            db: Database session
        """
        try:
            transcripts = []
            
            for message in messages:
                # Only process user and bot messages
                if message.get("role") not in ["user", "bot"]:
                    continue
                
                # Map VAPI roles to our roles
                role_mapping = {
                    "user": "human",
                    "bot": "assistant"
                }
                
                role = message.get("role", "")
                mapped_role = role_mapping.get(role, role)
                
                # Get message content
                content = message.get("message", "")
                
                # Extract time information
                time_seconds = message.get("secondsFromStart")
                end_time_seconds = None
                duration_seconds = None
                
                # If we have duration, convert from ms to seconds
                if "duration" in message:
                    duration_seconds = message["duration"] / 1000.0
                
                # If we have endTime and time, calculate end_time_seconds
                if "endTime" in message and "time" in message and time_seconds is not None:
                    end_time_seconds = time_seconds + (duration_seconds or 0)
                
                # Create transcript record using the correct field names
                transcript = Transcript()
                transcript.call_id = call_id
                transcript.role = mapped_role
                transcript.message = content
                transcript.time = time_seconds
                transcript.end_time = end_time_seconds
                transcript.duration = duration_seconds
                
                transcripts.append(transcript)
            
            # Add all transcripts to the database
            if transcripts:
                db.add_all(transcripts)
                await db.flush()
                
        except Exception as e:
            logger.error(f"Error saving transcripts: {str(e)}")
            raise 