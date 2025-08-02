"""
Activity service for generating and retrieving organization activity records.
"""

from datetime import datetime, date, timedelta
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, func, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Call, ServiceRecord, CallFeedback, Organization
from app.services.openai_service import OpenAIService


class ActivityService:
    """Service for generating and retrieving organization activity records."""
    
    # In-memory cache: {cache_key: (activities, timestamp)}
    _cache = {}
    _cache_ttl = timedelta(hours=24)
    
    @staticmethod
    def _get_cache_key(org_id: UUID, target_date: date) -> str:
        """Generate cache key for organization and date."""
        return f"{org_id}_{target_date.isoformat()}"
    
    @staticmethod
    def _is_cache_valid(timestamp: datetime) -> bool:
        """Check if cached data is still valid."""
        return datetime.now() - timestamp < ActivityService._cache_ttl
    
    @staticmethod
    async def get_recent_activities(
        db: AsyncSession,
        organization_id: UUID,
        limit: int = 5,
        date_for: Optional[date] = None
    ) -> List[Dict[str, Any]]:
        """
        Get recent activities for an organization with intelligent caching.
        
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
        cache_key = ActivityService._get_cache_key(organization_id, target_date)
        
        # Check cache first
        if cache_key in ActivityService._cache:
            cached_data, timestamp = ActivityService._cache[cache_key]
            if ActivityService._is_cache_valid(timestamp):
                return cached_data[:limit]
        
        # Generate fresh data
        activities = await ActivityService._generate_daily_activities(
            db, organization_id, target_date
        )
        
        # Cache the result
        ActivityService._cache[cache_key] = (activities, datetime.now())
        
        return activities[:limit]
    
    @staticmethod
    async def _generate_daily_activities(
        db: AsyncSession,
        organization_id: UUID,
        target_date: date
    ) -> List[Dict[str, Any]]:
        """Generate exactly 5 activities for the given date."""
        activities = []
        
        # Set date range for the entire day
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())
        
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
                activities.extend(ai_activities[:3])
            except Exception as e:
                # Fallback to traditional activities if AI fails
                activities.extend(ActivityService._get_traditional_activities(
                    activity_raw_data, end_datetime
                )[:3])
        else:
            # Use traditional activities when there's insufficient data for AI
            activities.extend(ActivityService._get_traditional_activities(
                activity_raw_data, end_datetime
            )[:3])

        # Add mandatory activities (last 2) - these always come from database queries
        
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
            "description": f"{ready_calls_count} calls are ready to be made",
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
            "priority": 2  # Always show second
        }
        activities.append(missed_calls_activity)
        
        # Ensure exactly 5 activities
        while len(activities) < 5:
            activities.append(ActivityService._get_fallback_activity(end_datetime))
        
        # Sort by priority and limit to 5
        sorted_activities = sorted(activities, key=lambda x: x["priority"])
        return sorted_activities[:5]
    
    @staticmethod
    async def _gather_activity_data(
        db: AsyncSession,
        organization_id: UUID,
        start_datetime: datetime,
        end_datetime: datetime
    ) -> Dict[str, Any]:
        """Gather raw data for activity generation."""
        
        # Get calls data
        calls_query = select(Call).where(
            and_(
                Call.organization_id == organization_id,
                Call.created_at >= start_datetime,
                Call.created_at <= end_datetime
            )
        ).order_by(desc(Call.created_at)).limit(10)
        
        calls_result = await db.execute(calls_query)
        calls = list(calls_result.scalars().all())
        
        # Get call feedback data (join with Call to get organization_id)
        feedback_query = select(CallFeedback).join(Call).where(
            and_(
                Call.organization_id == organization_id,
                CallFeedback.created_at >= start_datetime,
                CallFeedback.created_at <= end_datetime
            )
        ).order_by(desc(CallFeedback.created_at)).limit(10)
        
        feedback_result = await db.execute(feedback_query)
        feedback_records = list(feedback_result.scalars().all())
        
        # Get service records data
        service_records_query = select(ServiceRecord).where(
            and_(
                ServiceRecord.organization_id == organization_id,
                ServiceRecord.created_at >= start_datetime,
                ServiceRecord.created_at <= end_datetime
            )
        ).order_by(desc(ServiceRecord.created_at)).limit(10)
        
        service_records_result = await db.execute(service_records_query)
        service_records = list(service_records_result.scalars().all())
        
        # Determine if we have significant data for AI processing
        has_significant_data = (
            len(calls) >= 2 or 
            len(feedback_records) >= 1 or 
            len(service_records) >= 2
        )
        
        return {
            "calls": calls,
            "call_feedback": feedback_records,
            "service_records": service_records,
            "calls_count": len(calls),
            "feedback_count": len(feedback_records),
            "service_records_count": len(service_records),
            "has_significant_data": has_significant_data,
            "date_range": {
                "start": start_datetime.isoformat(),
                "end": end_datetime.isoformat()
            }
        }
    
    @staticmethod
    async def _get_organization_context(db: AsyncSession, organization_id: UUID) -> Dict[str, Any]:
        """Get organization context for AI processing."""
        org_query = select(Organization).where(Organization.id == organization_id)
        org_result = await db.execute(org_query)
        organization = org_result.scalar_one_or_none()
        
        if not organization:
            return {"name": "Unknown Organization", "industry": "General"}
        
        return {
            "name": organization.name,
            "industry": getattr(organization, 'industry', 'General'),
            "timezone": getattr(organization, 'timezone', 'UTC')
        }
    
    @staticmethod
    def _get_traditional_activities(
        activity_raw_data: Dict[str, Any],
        end_datetime: datetime
    ) -> List[Dict[str, Any]]:
        """Generate traditional non-AI activities as fallback."""
        activities = []
        
        # Activity based on calls
        if activity_raw_data["calls_count"] > 0:
            activities.append({
                "type": "calls_completed",
                "title": "Calls Completed",
                "description": f"{activity_raw_data['calls_count']} calls were processed",
                "count": activity_raw_data["calls_count"],
                "timestamp": end_datetime.isoformat(),
                "priority": 3
            })
        
        # Activity based on feedback
        if activity_raw_data["feedback_count"] > 0:
            activities.append({
                "type": "feedback_received",
                "title": "Customer Feedback",
                "description": f"{activity_raw_data['feedback_count']} feedback responses received",
                "count": activity_raw_data["feedback_count"],
                "timestamp": end_datetime.isoformat(),
                "priority": 4
            })
        
        # Activity based on service records
        if activity_raw_data["service_records_count"] > 0:
            activities.append({
                "type": "service_records",
                "title": "Service Records Updated",
                "description": f"{activity_raw_data['service_records_count']} service records were updated",
                "count": activity_raw_data["service_records_count"],
                "timestamp": end_datetime.isoformat(),
                "priority": 5
            })
        
        return activities
    
    @staticmethod
    def _get_fallback_activity(end_datetime: datetime) -> Dict[str, Any]:
        """Get a fallback activity when insufficient data."""
        return {
            "type": "no_activity",
            "title": "No Recent Activity",
            "description": "No significant activity captured for this period",
            "count": 0,
            "timestamp": end_datetime.isoformat(),
            "priority": 10  # Low priority
        } 