"""
Activity service for generating and retrieving organization activity records.
"""

from datetime import datetime, date, timedelta
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, func, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models import Call, ServiceRecord, CallFeedback


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
            "priority": 1  # Always show
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
