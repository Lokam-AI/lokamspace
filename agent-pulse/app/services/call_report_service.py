from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.logging import get_logger
from app.models.database import (
    Call, ServiceRecord, CampaignStatus, ServiceStatus, 
    Transcript, CallFeedback
)

logger = get_logger(__name__)

class CallReportService:
    """Service to handle end-of-call report data and update database records."""
    
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session
    
    async def process_end_call_report(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process end-of-call report data and update database records.
        
        Args:
            report_data: The complete end-of-call report JSON from VAPI
            
        Returns:
            Dict containing the processing result
        """
        try:
            # Extract call ID from assistant_overrides
            call_id = await self._extract_call_id_from_report(report_data)
            if not call_id:
                return {"success": False, "error": "No call_id found in assistant_overrides"}
            
            # Find the call record
            call = await self._get_call_by_id(call_id)
            if not call:
                return {"success": False, "error": f"Call with ID {call_id} not found"}
            
            # Update call record
            await self._update_call_record(call, report_data)
            
            # Update service record
            await self._update_service_record(call.service_record_id, report_data)
            
            # Create transcript records
            await self._create_transcript_records(call.id, report_data)
            
            # Create call feedback records
            await self._create_call_feedback_records(call.id, report_data)
            
            await self.db_session.commit()
            
            return {
                "success": True,
                "call_id": call.id,
                "service_record_id": call.service_record_id,
                "message": "Call report processed successfully"
            }
            
        except Exception as e:
            await self.db_session.rollback()
            logger.error(f"Error processing call report: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _extract_call_id_from_report(self, report_data: Dict[str, Any]) -> Optional[int]:
        """Extract call ID from assistant_overrides in the report."""
        try:
            # First try: call.assistantOverrides.variableValues.call_id (actual structure from debug file)
            call_data = report_data.get("call", {})
            assistant_overrides = call_data.get("assistantOverrides", {})
            variable_values = assistant_overrides.get("variableValues", {})
            
            call_id_str = variable_values.get("call_id")
            if call_id_str:
                logger.info(f"Found call_id: {call_id_str}")
                return int(call_id_str)
            
            # Second try: message.call.assistantOverrides.variableValues.call_id (VAPI webhook format)
            message = report_data.get("message", {})
            call_data = message.get("call", {})
            assistant_overrides = call_data.get("assistantOverrides", {})
            variable_values = assistant_overrides.get("variableValues", {})
            
            call_id_str = variable_values.get("call_id")
            if call_id_str:
                logger.info(f"Found call_id: {call_id_str}")
                return int(call_id_str)
            
            # Third try: raw_data.call.assistantOverrides.variableValues.call_id (fallback for saved data)
            raw_data = report_data.get("raw_data", {})
            call_data = raw_data.get("call", {})
            assistant_overrides = call_data.get("assistantOverrides", {})
            variable_values = assistant_overrides.get("variableValues", {})
            
            call_id_str = variable_values.get("call_id")
            if call_id_str:
                logger.info(f"Found call_id: {call_id_str}")
                return int(call_id_str)
            
            # Fourth try: raw_data.assistantOverrides.variableValues.call_id (another fallback)
            assistant_overrides = raw_data.get("assistantOverrides", {})
            variable_values = assistant_overrides.get("variableValues", {})
            
            call_id_str = variable_values.get("call_id")
            if call_id_str:
                logger.info(f"Found call_id: {call_id_str}")
                return int(call_id_str)
            
            # Fifth try: get from the main report data
            call_id_str = report_data.get("call_id")
            if call_id_str and call_id_str.isdigit():
                logger.info(f"Found call_id: {call_id_str}")
                return int(call_id_str)
            
            logger.error(f"Could not find call_id in any expected location")
                
        except (ValueError, TypeError) as e:
            logger.error(f"Error extracting call_id: {str(e)}")
        
        return None
    
    async def _get_call_by_id(self, call_id: int) -> Optional[Call]:
        """Find call record by ID."""
        query = select(Call).where(Call.id == call_id).options(selectinload(Call.service_record))
        result = await self.db_session.execute(query)
        call = result.scalar_one_or_none()
        
        if call:
            logger.info(f"Found call {call.id} for processing")
        
        return call
    
    async def _update_call_record(self, call: Call, report_data: Dict[str, Any]) -> None:
        """Update call record with data from the end-of-call report."""
        # Use VAPI structure: message.call
        call_data = report_data.get("message", {}).get("call", {})
        # Fallback to root for saved JSONs
        started_at_str = call_data.get("startedAt") or report_data.get("started_at")
        ended_at_str = call_data.get("endedAt") or report_data.get("ended_at")

        # Parse timestamps
        if started_at_str:
            call.call_started_at = datetime.fromisoformat(started_at_str.replace('Z', '+00:00'))
        if ended_at_str:
            call.call_ended_at = datetime.fromisoformat(ended_at_str.replace('Z', '+00:00'))

        # Calculate duration in seconds
        if call.call_started_at and call.call_ended_at:
            duration = call.call_ended_at - call.call_started_at
            call.duration_sec = int(duration.total_seconds())

        # Update status based on ended_reason - default to COMPLETED for end-of-call reports
        ended_reason = call_data.get("endedReason") or report_data.get("ended_reason", "")
        # Most end-of-call reports indicate successful completion
        if ended_reason in ["assistant-ended-call", "customer-ended-call", "hangup", "completed"]:
            call.status = CampaignStatus.COMPLETED
        elif ended_reason in ["failed", "error", "timeout"]:
            call.status = CampaignStatus.FAILED
        else:
            # Default to COMPLETED for end-of-call reports unless explicitly failed
            call.status = CampaignStatus.COMPLETED

        # Extract success evaluation from analysis
        analysis = call_data.get("analysis") or report_data.get("analysis", {})
        success_evaluation = analysis.get("successEvaluation")
        if success_evaluation:
            call.success_metric = success_evaluation

        # Extract cost
        cost = call_data.get("cost")
        if cost is None:
            cost = report_data.get("cost")
        if cost is not None:
            call.cost = float(cost)

        # Update modified timestamp
        call.modified_at = datetime.utcnow()
    
    async def _update_service_record(self, service_record_id: int, report_data: Dict[str, Any]) -> None:
        """Update service record with data from the end-of-call report."""
        # Get the service record
        query = select(ServiceRecord).where(ServiceRecord.id == service_record_id)
        result = await self.db_session.execute(query)
        service_record = result.scalar_one_or_none()
        if not service_record:
            raise ValueError(f"Service record with ID {service_record_id} not found")

        # Use VAPI structure: message.call
        call_data = report_data.get("message", {}).get("call", {})
        analysis = call_data.get("analysis") or report_data.get("analysis", {})
        summary = analysis.get("summary", "")
        if summary:
            service_record.summary = summary
        structured_data = analysis.get("structuredData", {})
        overall_feedback = structured_data.get("overall_feedback")
        if overall_feedback:
            service_record.overall_feedback = overall_feedback
        nps_score = structured_data.get("nps_score")
        if nps_score is not None:
            service_record.nps_score = float(nps_score)
        # Extract recording URL from artifact
        artifact = call_data.get("artifact") or report_data.get("artifact", {})
        recording_path = artifact.get("recordingPath")
        if recording_path:
            service_record.recording_url = recording_path
        # Update duration if available
        duration_sec = call_data.get("duration_sec") or report_data.get("duration_sec")
        if duration_sec:
            service_record.duration_sec = int(duration_sec)
        # Update status to completed
        service_record.status = ServiceStatus.COMPLETED
        # Update modified timestamp
        service_record.modified_at = datetime.utcnow()
    
    async def _create_transcript_records(self, call_id: int, report_data: Dict[str, Any]) -> None:
        """Create transcript records from the call report."""
        call_data = report_data.get("message", {}).get("call", {})
        messages = call_data.get("messages") or report_data.get("messages", [])
        for message in messages:
            role = message.get("role", "")
            message_text = message.get("message", "")
            time_ms = message.get("time", 0)
            end_time_ms = message.get("endTime", 0)
            duration_ms = message.get("duration", 0)
            time_sec = int(time_ms / 1000) if time_ms else 0
            end_time_sec = int(end_time_ms / 1000) if end_time_ms else 0
            duration_sec = float(duration_ms / 1000) if duration_ms else 0.0
            transcript = Transcript(
                role=role,
                call_id=call_id,
                message=message_text,
                time=time_sec,
                end_time=end_time_sec,
                duration=duration_sec,
                created_at=datetime.utcnow()
            )
            self.db_session.add(transcript)
        logger.info(f"Created {len(messages)} transcript records for call {call_id}")
    
    async def _create_call_feedback_records(self, call_id: int, report_data: Dict[str, Any]) -> None:
        """Create call feedback records from the call report."""
        call_data = report_data.get("message", {}).get("call", {})
        analysis = call_data.get("analysis") or report_data.get("analysis", {})
        structured_data = analysis.get("structuredData", {})
        
        # Extract feedback data
        overall_feedback = structured_data.get("overall_feedback", "")
        
        # Handle different formats for positives, detractors, and action_items
        positives = structured_data.get("positives", [])
        detractors = structured_data.get("detractors", [])
        action_items = structured_data.get("action_items", [])
        
        # Convert to lists if they're strings
        if isinstance(positives, str):
            positives = [positives] if positives else []
        if isinstance(detractors, str):
            detractors = [detractors] if detractors else []
        if isinstance(action_items, str):
            action_items = [action_items] if action_items else []
        
        # Convert lists to strings for storage
        positives_str = "\n".join(positives) if positives else ""
        detractors_str = "\n".join(detractors) if detractors else ""
        action_items_str = "\n".join(action_items) if action_items else ""
        
        # Create call feedback record
        call_feedback = CallFeedback(
            call_id=call_id,
            content=overall_feedback,
            detractos=detractors_str,  # Note: typo in schema field name
            positives=positives_str,
            action_items=action_items_str,
            created_at=datetime.utcnow()
        )
        
        self.db_session.add(call_feedback) 