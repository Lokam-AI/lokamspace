"""
Activity service for generating and retrieving organization activity records.
"""

from datetime import datetime, date, timedelta
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, func, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models import Call, ServiceRecord, CallFeedback, Organization
from app.services.openai_service import OpenAIService


class ActivityService:
    """Service for generating and retrieving organization activity records."""
    
    @staticmethod
    async def get_recent_activities(
        db: AsyncSession,
        organization_id: UUID,
        limit: int = 5,
        date_for: Optional[date] = None
    ) -> List[Dict[str, Any]]:
        """
        Get recent activities for an organization.
        
        Args:
            db: Database session
            organization_id: Organization ID
            limit: Maximum number of activities to return (default: 5)
            date_for: Date to fetch activities for (default: yesterday)
            
        Returns:
            List[Dict[str, Any]]: List of recent activities
        """
        # Default to yesterday if no date provided
        target_date = date_for or (datetime.now().date() - timedelta(days=1))
        
        # Set date range for the entire day
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())
        
        activities = []
        
        # First, gather raw data for AI summarization
        activity_raw_data = await ActivityService._gather_activity_data(
            db, organization_id, start_datetime, end_datetime
        )
        
        # Get organization data for context
        organization_data = await ActivityService._get_organization_context(db, organization_id)
        
        # Generate AI-powered activity summaries for the top 3 activities
        ai_activities = []
        if activity_raw_data["has_significant_data"]:
            try:
                openai_service = OpenAIService()
                ai_activities = await openai_service.summarize_daily_activities(
                    organization_data=organization_data,
                    activity_data=activity_raw_data,
                    date_str=target_date.isoformat()
                )
                # Add count and timestamp to AI activities
                for i, activity in enumerate(ai_activities):
                    activity["count"] = activity_raw_data.get(f"{activity['type']}_count", 0)
                    activity["timestamp"] = end_datetime.isoformat()
                    if "priority" not in activity:
                        activity["priority"] = 3 + i  # Priorities 3, 4, 5
                activities.extend(ai_activities)
            except Exception as e:
                # Fallback to traditional activities if AI fails
                activities.extend(ActivityService._get_traditional_activities(
                    activity_raw_data, end_datetime
                ))
        else:
            # Use traditional activities when there's insufficient data for AI
            activities.extend(ActivityService._get_traditional_activities(
                activity_raw_data, end_datetime
            ))

        # Add mandatory activities after AI-generated ones
        # 1. Get calls marked as "Ready for Call" count (mandatory)
        ready_calls_query = select(func.count(Call.id)).where(
            and_(
                Call.organization_id == organization_id,
                Call.status == "Ready",
                Call.created_at >= start_datetime,
                Call.created_at <= end_datetime
            )
        )
        ready_calls_result = await db.execute(ready_calls_query)
        ready_calls_count = ready_calls_result.scalar_one_or_none() or 0
        
        ready_calls_activity = {
            "type": "ready_calls",
            "title": "Ready for Call",
            "description": f"{ready_calls_count} calls marked as ready",
            "count": ready_calls_count,
            "timestamp": end_datetime.isoformat(),
            "priority": 1  # Always show first
        }
        activities.append(ready_calls_activity)
        
        # 2. Get calls marked as "Missed" or "Failed" count (mandatory)
        missed_calls_query = select(func.count(Call.id)).where(
            and_(
                Call.organization_id == organization_id,
                Call.status.in_(["Missed", "Failed"]),
                Call.created_at >= start_datetime,
                Call.created_at <= end_datetime
            )
        )
        missed_calls_result = await db.execute(missed_calls_query)
        missed_calls_count = missed_calls_result.scalar_one_or_none() or 0
        
        missed_calls_activity = {
            "type": "missed_calls",
            "title": "Missed or Failed Calls",
            "description": f"{missed_calls_count} calls were missed or failed",
            "count": missed_calls_count,
            "timestamp": end_datetime.isoformat(),
            "priority": 2  # Always show
        }
        activities.append(missed_calls_activity)
        
        # 3. Check for new promoters (NPS >= 9)
        promoters_query = select(func.count(Call.id)).where(
            and_(
                Call.organization_id == organization_id,
                Call.nps_score >= 9,
                Call.created_at >= start_datetime,
                Call.created_at <= end_datetime
            )
        )
        promoters_result = await db.execute(promoters_query)
        promoters_count = promoters_result.scalar_one_or_none() or 0
        
        if promoters_count > 0:
            promoters_activity = {
                "type": "promoters",
                "title": "New Promoters",
                "description": f"{promoters_count} new promoters identified",
                "count": promoters_count,
                "timestamp": end_datetime.isoformat(),
                "priority": 3
            }
            activities.append(promoters_activity)
        
        # 4. Check for new detractors (NPS <= 5)
        detractors_query = select(func.count(Call.id)).where(
            and_(
                Call.organization_id == organization_id,
                Call.nps_score <= 5,
                Call.created_at >= start_datetime,
                Call.created_at <= end_datetime
            )
        )
        detractors_result = await db.execute(detractors_query)
        detractors_count = detractors_result.scalar_one_or_none() or 0
        
        if detractors_count > 0:
            detractors_activity = {
                "type": "detractors",
                "title": "New Detractors",
                "description": f"{detractors_count} new detractors identified",
                "count": detractors_count,
                "timestamp": end_datetime.isoformat(),
                "priority": 4
            }
            activities.append(detractors_activity)
        
        # 5. Check for completed calls with feedback
        feedback_query = select(func.count(CallFeedback.id)).join(Call).where(
            and_(
                Call.organization_id == organization_id,
                Call.status == "Completed",
                Call.created_at >= start_datetime,
                Call.created_at <= end_datetime
            )
        )
        feedback_result = await db.execute(feedback_query)
        feedback_count = feedback_result.scalar_one_or_none() or 0
        
        if feedback_count > 0:
            feedback_activity = {
                "type": "feedback",
                "title": "Call Feedback",
                "description": f"{feedback_count} calls completed with feedback",
                "count": feedback_count,
                "timestamp": end_datetime.isoformat(),
                "priority": 5
            }
            activities.append(feedback_activity)
        
        # 6. Check for new service records
        service_records_query = select(func.count(ServiceRecord.id)).where(
            and_(
                ServiceRecord.organization_id == organization_id,
                ServiceRecord.created_at >= start_datetime,
                ServiceRecord.created_at <= end_datetime
            )
        )
        service_records_result = await db.execute(service_records_query)
        service_records_count = service_records_result.scalar_one_or_none() or 0
        
        if service_records_count > 0:
            service_records_activity = {
                "type": "service_records",
                "title": "Service Records",
                "description": f"{service_records_count} new service records added",
                "count": service_records_count,
                "timestamp": end_datetime.isoformat(),
                "priority": 6
            }
            activities.append(service_records_activity)
        
        # Sort by priority and limit to requested number
        sorted_activities = sorted(activities, key=lambda x: x["priority"])
        
        # If we have less than the requested limit, add fallback activities
        if len(sorted_activities) < limit:
            fallbacks = ActivityService._get_fallback_activities(
                remaining=limit - len(sorted_activities)
            )
            sorted_activities.extend(fallbacks)
        
        return sorted_activities[:limit]
    
    @staticmethod
    async def _gather_activity_data(
        db: AsyncSession,
        organization_id: UUID,
        start_datetime: datetime,
        end_datetime: datetime
    ) -> Dict[str, Any]:
        """
        Gather raw activity data for AI summarization.
        
        Returns comprehensive data about calls, feedback, and service records
        that can be used by AI to generate intelligent summaries.
        """
        # Get calls data
        calls_query = select(Call).where(
            and_(
                Call.organization_id == organization_id,
                Call.created_at >= start_datetime,
                Call.created_at <= end_datetime
            )
        )
        calls_result = await db.execute(calls_query)
        calls = calls_result.scalars().all()
        
        # Get feedback data
        feedback_query = select(CallFeedback).join(Call).where(
            and_(
                Call.organization_id == organization_id,
                Call.created_at >= start_datetime,
                Call.created_at <= end_datetime
            )
        )
        feedback_result = await db.execute(feedback_query)
        feedback_records = feedback_result.scalars().all()
        
        # Get service records data
        service_records_query = select(ServiceRecord).where(
            and_(
                ServiceRecord.organization_id == organization_id,
                ServiceRecord.created_at >= start_datetime,
                ServiceRecord.created_at <= end_datetime
            )
        )
        service_records_result = await db.execute(service_records_query)
        service_records = service_records_result.scalars().all()
        
        # Analyze the data
        total_calls = len(calls)
        completed_calls = [c for c in calls if c.status == "Completed"]
        promoters = [c for c in calls if c.nps_score and c.nps_score >= 9]
        detractors = [c for c in calls if c.nps_score and c.nps_score <= 5]
        
        positive_feedback = [f for f in feedback_records if f.type == "positives"]
        negative_feedback = [f for f in feedback_records if f.type == "detractors"]
        
        completed_service_records = [sr for sr in service_records if sr.status == "Completed"]
        
        # Determine if we have significant data for AI analysis
        has_significant_data = (
            len(promoters) > 0 or len(detractors) > 0 or 
            len(positive_feedback) > 0 or len(negative_feedback) > 0 or
            len(completed_service_records) > 2
        )
        
        return {
            "has_significant_data": has_significant_data,
            "total_calls": total_calls,
            "completed_calls_count": len(completed_calls),
            "promoters": {
                "count": len(promoters),
                "nps_scores": [c.nps_score for c in promoters],
                "details": [
                    {
                        "customer_name": c.service_record.customer_name if c.service_record else "Unknown",
                        "service_type": c.service_record.service_type if c.service_record else "Unknown",
                        "nps_score": c.nps_score,
                        "feedback_summary": c.feedback_summary
                    } for c in promoters[:5]  # Limit to top 5 for AI processing
                ]
            },
            "detractors": {
                "count": len(detractors),
                "nps_scores": [c.nps_score for c in detractors],
                "details": [
                    {
                        "customer_name": c.service_record.customer_name if c.service_record else "Unknown",
                        "service_type": c.service_record.service_type if c.service_record else "Unknown", 
                        "nps_score": c.nps_score,
                        "feedback_summary": c.feedback_summary
                    } for c in detractors[:5]  # Limit to top 5 for AI processing
                ]
            },
            "positive_feedback": {
                "count": len(positive_feedback),
                "items": [f.kpis for f in positive_feedback[:10]]  # Top 10 positive mentions
            },
            "negative_feedback": {
                "count": len(negative_feedback),
                "items": [f.kpis for f in negative_feedback[:10]]  # Top 10 negative mentions
            },
            "service_records": {
                "total_count": len(service_records),
                "completed_count": len(completed_service_records),
                "completion_rate": len(completed_service_records) / len(service_records) * 100 if service_records else 0,
                "types": list(set([sr.service_type for sr in service_records if sr.service_type]))[:5]
            },
            "promoters_count": len(promoters),
            "detractors_count": len(detractors),
            "feedback_count": len(feedback_records),
            "service_records_count": len(service_records)
        }
    
    @staticmethod
    async def _get_organization_context(db: AsyncSession, organization_id: UUID) -> Dict[str, Any]:
        """Get organization context for AI summarization."""
        org_query = select(Organization).where(Organization.id == organization_id)
        org_result = await db.execute(org_query)
        organization = org_result.scalar_one_or_none()
        
        if not organization:
            return {
                "name": "Service Center",
                "description": "Automotive service center",
                "service_center_description": "",
                "location": "N/A",
                "focus_areas": []
            }
        
        return {
            "name": organization.name or "Service Center",
            "description": organization.description or "Automotive service center",
            "service_center_description": organization.service_center_description or "",
            "location": organization.location or "N/A",
            "focus_areas": organization.focus_areas or []
        }
    
    @staticmethod
    def _get_traditional_activities(
        activity_raw_data: Dict[str, Any], 
        end_datetime: datetime
    ) -> List[Dict[str, Any]]:
        """
        Generate traditional (non-AI) activities as fallback.
        
        This method creates activities using the original logic when AI
        summarization is not available or fails.
        """
        activities = []
        
        # Promoters activity
        promoters_count = activity_raw_data.get("promoters_count", 0)
        if promoters_count > 0:
            activities.append({
                "type": "promoters",
                "title": "New Promoters",
                "description": f"{promoters_count} new promoters identified",
                "count": promoters_count,
                "timestamp": end_datetime.isoformat(),
                "priority": 3
            })
        
        # Detractors activity  
        detractors_count = activity_raw_data.get("detractors_count", 0)
        if detractors_count > 0:
            activities.append({
                "type": "detractors",
                "title": "New Detractors", 
                "description": f"{detractors_count} new detractors identified",
                "count": detractors_count,
                "timestamp": end_datetime.isoformat(),
                "priority": 4
            })
        
        # Feedback activity
        feedback_count = activity_raw_data.get("feedback_count", 0)
        if feedback_count > 0:
            activities.append({
                "type": "feedback",
                "title": "Call Feedback",
                "description": f"{feedback_count} calls completed with feedback",
                "count": feedback_count,
                "timestamp": end_datetime.isoformat(),
                "priority": 5
            })
        
        # Service records activity
        service_records_count = activity_raw_data.get("service_records_count", 0)
        if service_records_count > 0:
            activities.append({
                "type": "service_records",
                "title": "Service Records",
                "description": f"{service_records_count} new service records added",
                "count": service_records_count,
                "timestamp": end_datetime.isoformat(),
                "priority": 6
            })
        
        return activities[:3]  # Return top 3
    
    @staticmethod
    def _get_fallback_activities(remaining: int) -> List[Dict[str, Any]]:
        """
        Get fallback activities when there's insufficient data.
        
        Args:
            remaining: Number of fallback activities needed
            
        Returns:
            List[Dict[str, Any]]: List of fallback activities
        """
        fallbacks = [
            {
                "type": "fallback_dms",
                "title": "DMS Sync",
                "description": "No new records to sync",
                "count": 0,
                "timestamp": datetime.now().isoformat(),
                "priority": 10,
                "is_fallback": True
            },
            {
                "type": "fallback_weekly_report",
                "title": "Weekly Report",
                "description": "Weekly report summary available",
                "count": 0,
                "timestamp": datetime.now().isoformat(),
                "priority": 11,
                "is_fallback": True
            },
            {
                "type": "fallback_system",
                "title": "System Health",
                "description": "All systems operating normally",
                "count": 0,
                "timestamp": datetime.now().isoformat(),
                "priority": 12,
                "is_fallback": True
            }
        ]
        
        return fallbacks[:remaining]
