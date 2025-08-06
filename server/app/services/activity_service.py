"""
Activity service for generating and retrieving organization activity records.
"""

from datetime import datetime, date, timedelta
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, func, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Call, Organization


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
    ) -> Dict[str, Any]:
        """
        Get recent activities for an organization with intelligent caching.
        
        Args:
            db: Database session
            organization_id: Organization ID
            limit: Maximum number of activities to return (default: 5)
            date_for: Date to fetch activities for (default: yesterday)
            
        Returns:
            Dict[str, Any]: Dictionary containing target_date and activities list
        """
        # Default to yesterday if no date provided
        target_date = date_for or (datetime.now().date() - timedelta(days=1))
        cache_key = ActivityService._get_cache_key(organization_id, target_date)
        
        # Check cache first
        if cache_key in ActivityService._cache:
            cached_data, timestamp = ActivityService._cache[cache_key]
            if ActivityService._is_cache_valid(timestamp):
                # Return cached data with limited activities
                return {
                    "target_date": cached_data["target_date"],
                    "activities": cached_data["activities"][:limit]
                }
        
        # Generate fresh data
        activities = await ActivityService._generate_daily_activities(
            db, organization_id, target_date
        )
        
        # Add date metadata to the activities
        activities_with_date = {
            "target_date": target_date.strftime("%B %d, %Y"),
            "activities": activities
        }
        
        # Cache the result
        ActivityService._cache[cache_key] = (activities_with_date, datetime.now())
        
        return activities_with_date
    
    @staticmethod
    async def _generate_daily_activities(
        db: AsyncSession,
        organization_id: UUID,
        target_date: date
    ) -> List[Dict[str, Any]]:
        """Generate exactly 5 activities for the given date based on previous day's data only."""
        activities = []
        
        # Set date range for the entire target day (previous day)
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())
        
        # 1. Ready for Call - calls that became ready on the target date (previous day)
        ready_calls_query = select(func.count(Call.id)).where(
            and_(
                Call.organization_id == organization_id,
                Call.status == "Ready",
                func.coalesce(Call.created_at, Call.start_time) >= start_datetime,
                func.coalesce(Call.created_at, Call.start_time) <= end_datetime
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
            "priority": 1
        }
        activities.append(ready_calls_activity)
        
        # 2. Missed Calls - strictly from the target date (previous day)
        missed_calls_query = select(func.count(Call.id)).where(
            and_(
                Call.organization_id == organization_id,
                Call.status.in_(["Missed", "Failed"]),
                func.coalesce(Call.start_time, Call.created_at) >= start_datetime,
                func.coalesce(Call.start_time, Call.created_at) <= end_datetime
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
            "priority": 2
        }
        activities.append(missed_calls_activity)
        
        # 3. Completed Calls - strictly from the target date (previous day)
        completed_calls_query = select(func.count(Call.id)).where(
            and_(
                Call.organization_id == organization_id,
                Call.status == "Completed",
                func.coalesce(Call.end_time, Call.created_at) >= start_datetime,
                func.coalesce(Call.end_time, Call.created_at) <= end_datetime
            )
        )
        completed_calls_result = await db.execute(completed_calls_query)
        completed_calls_count = completed_calls_result.scalar_one_or_none() or 0
        
        completed_calls_activity = {
            "type": "completed_calls",
            "title": "Completed Calls",
            "description": f"{completed_calls_count} calls were completed",
            "count": completed_calls_count,
            "timestamp": end_datetime.isoformat(),
            "priority": 3
        }
        activities.append(completed_calls_activity)
        
        # 4. Number of Detractors (NPS score 0-6, but we'll use 0-6 for detractors) - strictly from the target date (previous day)
        detractors_query = select(func.count(Call.id)).where(
            and_(
                Call.organization_id == organization_id,
                Call.nps_score.between(0, 6),  # Detractors are typically 0-6, Passives 7-8, Promoters 9-10
                func.coalesce(Call.end_time, Call.created_at) >= start_datetime,
                func.coalesce(Call.end_time, Call.created_at) <= end_datetime
            )
        )
        detractors_result = await db.execute(detractors_query)
        detractors_count = detractors_result.scalar_one_or_none() or 0
        
        detractors_activity = {
            "type": "detractors",
            "title": "Number of Detractors",
            "description": f"{detractors_count} detractors (NPS 0-6) recorded",
            "count": detractors_count,
            "timestamp": end_datetime.isoformat(),
            "priority": 4
        }
        activities.append(detractors_activity)
        
        # 5. Average NPS - strictly from the target date (previous day)
        avg_nps_query = select(func.avg(Call.nps_score)).where(
            and_(
                Call.organization_id == organization_id,
                Call.nps_score.isnot(None),
                func.coalesce(Call.end_time, Call.created_at) >= start_datetime,
                func.coalesce(Call.end_time, Call.created_at) <= end_datetime
            )
        )
        avg_nps_result = await db.execute(avg_nps_query)
        avg_nps_raw = avg_nps_result.scalar_one_or_none()
        avg_nps = round(float(avg_nps_raw), 1) if avg_nps_raw is not None else 0.0
        
        # Count total NPS responses for context
        nps_count_query = select(func.count(Call.id)).where(
            and_(
                Call.organization_id == organization_id,
                Call.nps_score.isnot(None),
                func.coalesce(Call.end_time, Call.created_at) >= start_datetime,
                func.coalesce(Call.end_time, Call.created_at) <= end_datetime
            )
        )
        nps_count_result = await db.execute(nps_count_query)
        nps_count = nps_count_result.scalar_one_or_none() or 0
        
        avg_nps_activity = {
            "type": "average_nps",
            "title": "Average NPS",
            "description": f"Average NPS score of {avg_nps} from {nps_count} responses",
            "count": int(avg_nps * 10),  # Store as integer for display purposes (e.g., 85 for 8.5)
            "timestamp": end_datetime.isoformat(),
            "priority": 5
        }
        activities.append(avg_nps_activity)
        
        return activities 