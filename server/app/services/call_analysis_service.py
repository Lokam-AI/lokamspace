"""
Call Analysis service for processing call transcripts.
"""

import logging
from typing import Dict, List, Any, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Call, CallFeedback, Organization, ServiceRecord, Tag, Transcript
from app.services.openai_service import OpenAIService

logger = logging.getLogger(__name__)


class CallAnalysisService:
    """Service for analyzing call transcripts."""
    
    @staticmethod
    async def trigger_after_call_analysis(
        call_id: int,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Trigger and process after-call analysis for a completed call.
        
        Args:
            call_id: The ID of the call to analyze
            db: Database session
            
        Returns:
            Dict: Analysis results and status
        """
        try:
            # 1. Get call details
            call_query = select(Call).where(Call.id == call_id)
            result = await db.execute(call_query)
            call = result.scalar_one_or_none()
            
            if not call:
                return {"status": "error", "message": f"Call with ID {call_id} not found"}
            
            # 2. Get organization details
            org_id = call.organization_id
            org_query = select(Organization).where(Organization.id == org_id)
            org_result = await db.execute(org_query)
            organization = org_result.scalar_one_or_none()
            
            if not organization:
                return {"status": "error", "message": "Organization not found"}
            
            # 3. Get service record details
            if call.service_record_id:
                service_query = select(ServiceRecord).where(
                    ServiceRecord.id == call.service_record_id,
                    ServiceRecord.organization_id == org_id
                )
                service_result = await db.execute(service_query)
                service_record = service_result.scalar_one_or_none()
            else:
                service_record = None
            
            # 4. Get transcript messages
            transcript_query = select(Transcript).where(Transcript.call_id == call_id)
            transcript_result = await db.execute(transcript_query)
            transcripts = transcript_result.scalars().all()
            
            if not transcripts:
                return {"status": "error", "message": "No transcript found for call"}
            
            # 5. Get organization's tags for classification
            tag_query = select(Tag).where(
                Tag.organization_id == org_id,
                Tag.type == "areas_to_focus"  # Only get tags with the "areas_to_focus" type
            )
            tag_result = await db.execute(tag_query)
            tags = [tag.name for tag in tag_result.scalars().all()]
            
            # 6. Prepare data for analysis
            transcript_messages = [
                {"role": t.role, "message": t.message} for t in transcripts
            ]
            
            service_record_data = {}
            if service_record:
                service_record_data = {
                    "customer_name": service_record.customer_name,
                    "service_type": service_record.service_type,
                    "vehicle_info": service_record.vehicle_info,
                    "service_advisor_name": service_record.service_advisor_name,
                }
            
            organization_data = {
                "name": organization.name,
                "description": organization.description,
                "service_center_description": organization.service_center_description,
                "focus_areas": organization.focus_areas,
                "areas_to_improve": tags,  # This field doesn't exist in the model yet
                "location": organization.location,
            }
            
            # 7. Process the analysis with OpenAI
            openai_service = OpenAIService()
            analysis_result = await openai_service.analyze_call_transcript(
                transcript_messages,
                service_record_data,
                organization_data,
                tags
            )
            
            # 8. Store analysis results in the database
            await CallAnalysisService._store_analysis_results(call, analysis_result, db)
            
            # 9. Return results
            return {
                "status": "success",
                "message": "Call analysis completed successfully",
                "analysis": analysis_result
            }
            
        except Exception as e:
            logger.error(f"Error in after-call analysis: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    @staticmethod
    async def _store_analysis_results(
        call: Call,
        analysis: Dict[str, Any],
        db: AsyncSession
    ) -> None:
        """
        Store call analysis results in the database.
        
        Args:
            call: Call object
            analysis: Analysis results from OpenAI
            db: Database session
        """
        # 1. Update call with summary and NPS score
        call.call_summary = analysis.get("call_summary")
        call.nps_score = analysis.get("nps_score")
        call.feedback_summary = analysis.get("overall_feedback")
        
        # 2. Create call_feedback records for positive mentions
        positive_mentions = analysis.get("positive_mentions", [])
        if positive_mentions:
            # Create individual feedback records for each positive mention
            for mention in positive_mentions:
                clean_mention = mention[1:-1].strip() if mention.startswith('"') and mention.endswith('"') else mention.strip()
                positive_feedback = CallFeedback(
                    call_id=call.id,
                    type="positives",
                    kpis=clean_mention  # Store as a single string, not an array
                )
                db.add(positive_feedback)
        
        # 3. Create call_feedback records for detractors
        detractors = analysis.get("detractors", [])
        if detractors:
            # Create individual feedback records for each detractor
            for detractor in detractors:
                clean_detractor = detractor[1:-1].strip() if detractor.startswith('"') and detractor.endswith('"') else detractor.strip()
                negative_feedback = CallFeedback(
                    call_id=call.id,
                    type="detractors",
                    kpis=clean_detractor  # Store as a single string, not an array
                )
                db.add(negative_feedback)
        
        # 4. Commit all changes
        await db.commit() 