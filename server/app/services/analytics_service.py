"""
Analytics service for generating metrics and reports.
"""

from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import func, select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException
from app.models import Call, Campaign, ServiceRecord, Transcript, CallFeedback, Tag


class AnalyticsService:
    """Service for generating analytics and metrics."""
    
    @staticmethod
    async def get_dashboard_metrics(
        db: AsyncSession,
        organization_id: UUID,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """
        Get dashboard metrics.
        
        Args:
            db: Database session
            organization_id: Organization ID
            start_date: Start date for metrics
            end_date: End date for metrics
            
        Returns:
            Dict[str, Any]: Dashboard metrics
        """
        # Get call metrics
        call_metrics = await AnalyticsService.get_call_metrics(
            db=db,
            organization_id=organization_id,
            start_date=start_date,
            end_date=end_date
        )
        
        # Get service record metrics
        service_record_metrics = await AnalyticsService.get_service_record_metrics(
            db=db,
            organization_id=organization_id,
            start_date=start_date,
            end_date=end_date
        )
        
        # Get active campaigns count
        active_campaigns_query = select(func.count(Campaign.id)).where(
            Campaign.organization_id == organization_id,
            Campaign.status == "Active"
        )
        active_campaigns_result = await db.execute(active_campaigns_query)
        active_campaigns_count = active_campaigns_result.scalar_one_or_none() or 0
        
        # Combine metrics
        return {
            "calls": call_metrics,
            "service_records": service_record_metrics,
            "campaigns": {
                "active_count": active_campaigns_count,
                "total_calls": call_metrics.get("total_count", 0),
                "completion_rate": call_metrics.get("completion_rate", 0)
            },
            "time_period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": (end_date - start_date).days
            }
        }
    
    @staticmethod
    async def get_call_metrics(
        db: AsyncSession,
        organization_id: UUID,
        start_date: date,
        end_date: date,
        campaign_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Get call metrics.
        
        Args:
            db: Database session
            organization_id: Organization ID
            start_date: Start date for metrics
            end_date: End date for metrics
            campaign_id: Filter by campaign ID
            
        Returns:
            Dict[str, Any]: Call metrics
        """
        # Convert dates to datetime for comparison with database fields
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        # Base query for all calls in the date range
        base_query = select(Call).where(
            Call.organization_id == organization_id,
            Call.created_at >= start_datetime,
            Call.created_at <= end_datetime
        )
        
        # Apply campaign filter if provided
        if campaign_id is not None:
            base_query = base_query.where(Call.campaign_id == campaign_id)
        
        # Execute query to get all calls
        result = await db.execute(base_query)
        calls = result.scalars().all()
        
        # Calculate metrics
        total_count = len(calls)
        completed_calls = [call for call in calls if call.status == "Completed"]
        completed_count = len(completed_calls)
        missed_calls = [call for call in calls if call.status == "Missed"]
        missed_count = len(missed_calls)
        scheduled_calls = [call for call in calls if call.status == "Scheduled"]
        scheduled_count = len(scheduled_calls)
        
        # Calculate completion rate
        completion_rate = 0
        if total_count > 0:
            completion_rate = (completed_count / total_count) * 100
        
        # Calculate average duration
        durations = [call.duration for call in completed_calls if call.duration is not None]
        avg_duration = sum(durations) / len(durations) if durations else 0
        
        # Get call types distribution
        call_types = {}
        for call in calls:
            call_type = call.call_type
            if call_type not in call_types:
                call_types[call_type] = 0
            call_types[call_type] += 1
        
        return {
            "total_count": total_count,
            "completed_count": completed_count,
            "missed_count": missed_count,
            "scheduled_count": scheduled_count,
            "completion_rate": completion_rate,
            "avg_duration": avg_duration,
            "call_types": call_types,
            "daily_distribution": await AnalyticsService._get_daily_distribution(
                calls=calls,
                start_date=start_date,
                end_date=end_date
            )
        }
    
    @staticmethod
    async def get_service_record_metrics(
        db: AsyncSession,
        organization_id: UUID,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """
        Get service record metrics.
        
        Args:
            db: Database session
            organization_id: Organization ID
            start_date: Start date for metrics
            end_date: End date for metrics
            
        Returns:
            Dict[str, Any]: Service record metrics
        """
        # Convert dates to datetime for comparison with database fields
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        # Query for service records in the date range
        query = select(ServiceRecord).where(
            ServiceRecord.organization_id == organization_id,
            ServiceRecord.created_at >= start_datetime,
            ServiceRecord.created_at <= end_datetime
        )
        
        result = await db.execute(query)
        service_records = result.scalars().all()
        
        # Calculate metrics
        total_count = len(service_records)
        status_counts = {}
        vehicle_makes = {}
        service_types = {}
        total_amount = 0
        
        for record in service_records:
            # Count by status
            status = record.status
            if status not in status_counts:
                status_counts[status] = 0
            status_counts[status] += 1
            
            # Count by vehicle make
            vehicle_make = record.vehicle_make
            if vehicle_make:
                if vehicle_make not in vehicle_makes:
                    vehicle_makes[vehicle_make] = 0
                vehicle_makes[vehicle_make] += 1
            
            # Count by service type
            service_type = record.service_type
            if service_type:
                if service_type not in service_types:
                    service_types[service_type] = 0
                service_types[service_type] += 1
            
            # Sum total amount
            if record.total_amount:
                total_amount += record.total_amount
        
        # Calculate completion rate
        completed_count = status_counts.get("Completed", 0)
        completion_rate = 0
        if total_count > 0:
            completion_rate = (completed_count / total_count) * 100
        
        return {
            "total_count": total_count,
            "status_distribution": status_counts,
            "vehicle_makes": vehicle_makes,
            "service_types": service_types,
            "total_amount": total_amount,
            "avg_amount": total_amount / total_count if total_count > 0 else 0,
            "completion_rate": completion_rate
        }
    
    @staticmethod
    async def get_campaign_analytics(
        db: AsyncSession,
        campaign_id: int,
        organization_id: UUID,
        end_date: date,
        start_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Get campaign analytics.
        
        Args:
            db: Database session
            campaign_id: Campaign ID
            organization_id: Organization ID
            end_date: End date for analytics
            start_date: Start date for analytics (optional)
            
        Returns:
            Dict[str, Any]: Campaign analytics
        """
        # Get campaign details
        campaign_query = select(Campaign).where(
            Campaign.id == campaign_id,
            Campaign.organization_id == organization_id
        )
        campaign_result = await db.execute(campaign_query)
        campaign = campaign_result.scalar_one_or_none()
        
        if not campaign:
            raise BadRequestException("Campaign not found")
        
        # If start date not provided, use campaign created date
        if not start_date:
            start_date = campaign.created_at.date() if campaign.created_at else end_date - timedelta(days=30)
        
        # Get call metrics for this campaign
        call_metrics = await AnalyticsService.get_call_metrics(
            db=db,
            organization_id=organization_id,
            start_date=start_date,
            end_date=end_date,
            campaign_id=campaign_id
        )
        
        # Get service records associated with this campaign
        service_records_query = select(ServiceRecord).where(
            ServiceRecord.campaign_id == campaign_id,
            ServiceRecord.organization_id == organization_id,
            ServiceRecord.created_at >= datetime.combine(start_date, datetime.min.time()),
            ServiceRecord.created_at <= datetime.combine(end_date, datetime.max.time())
        )
        service_records_result = await db.execute(service_records_query)
        service_records = service_records_result.scalars().all()
        
        # Calculate service record metrics
        total_service_records = len(service_records)
        total_amount = sum(record.total_amount for record in service_records if record.total_amount)
        
        # Calculate conversion rate (calls to service records)
        conversion_rate = 0
        if call_metrics["total_count"] > 0:
            conversion_rate = (total_service_records / call_metrics["total_count"]) * 100
        
        return {
            "campaign": {
                "id": campaign.id,
                "name": campaign.name,
                "status": campaign.status,
                "created_at": campaign.created_at.isoformat() if campaign.created_at else None,
                "start_date": campaign.start_date.isoformat() if campaign.start_date else None,
                "end_date": campaign.end_date.isoformat() if campaign.end_date else None
            },
            "calls": call_metrics,
            "service_records": {
                "total_count": total_service_records,
                "total_amount": total_amount,
                "avg_amount": total_amount / total_service_records if total_service_records > 0 else 0
            },
            "conversion_rate": conversion_rate,
            "time_period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": (end_date - start_date).days
            }
        }
    
    @staticmethod
    async def get_trend_analysis(
        db: AsyncSession,
        organization_id: UUID,
        metric_type: str,
        time_period: str,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """
        Get trend analysis for various metrics.
        
        Args:
            db: Database session
            organization_id: Organization ID
            metric_type: Type of metric to analyze (calls, service_records, revenue)
            time_period: Time period for grouping (daily, weekly, monthly)
            start_date: Start date for analysis
            end_date: End date for analysis
            
        Returns:
            Dict[str, Any]: Trend analysis data
        """
        # Validate metric type
        valid_metrics = ["calls", "service_records", "revenue"]
        if metric_type not in valid_metrics:
            raise BadRequestException(f"Invalid metric type. Must be one of: {', '.join(valid_metrics)}")
        
        # Validate time period
        valid_periods = ["daily", "weekly", "monthly"]
        if time_period not in valid_periods:
            raise BadRequestException(f"Invalid time period. Must be one of: {', '.join(valid_periods)}")
        
        # Generate time periods for the analysis
        time_periods = AnalyticsService._generate_time_periods(
            start_date=start_date,
            end_date=end_date,
            period_type=time_period
        )
        
        # Get trend data based on metric type
        trend_data = []
        if metric_type == "calls":
            trend_data = await AnalyticsService._get_call_trends(
                db=db,
                organization_id=organization_id,
                time_periods=time_periods
            )
        elif metric_type == "service_records":
            trend_data = await AnalyticsService._get_service_record_trends(
                db=db,
                organization_id=organization_id,
                time_periods=time_periods
            )
        elif metric_type == "revenue":
            trend_data = await AnalyticsService._get_revenue_trends(
                db=db,
                organization_id=organization_id,
                time_periods=time_periods
            )
        
        return {
            "metric_type": metric_type,
            "time_period": time_period,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "data": trend_data
        }
    
    @staticmethod
    def _generate_time_periods(
        start_date: date,
        end_date: date,
        period_type: str
    ) -> List[Dict[str, date]]:
        """
        Generate time periods for trend analysis.
        
        Args:
            start_date: Start date
            end_date: End date
            period_type: Type of period (daily, weekly, monthly)
            
        Returns:
            List[Dict[str, date]]: List of time periods with start and end dates
        """
        periods = []
        current_date = start_date
        
        if period_type == "daily":
            # Daily periods
            while current_date <= end_date:
                periods.append({
                    "start": current_date,
                    "end": current_date
                })
                current_date += timedelta(days=1)
                
        elif period_type == "weekly":
            # Weekly periods (starting from Monday)
            # Adjust start_date to previous Monday if not already a Monday
            days_to_monday = current_date.weekday()
            if days_to_monday > 0:
                current_date = current_date - timedelta(days=days_to_monday)
            
            while current_date <= end_date:
                period_end = min(current_date + timedelta(days=6), end_date)
                periods.append({
                    "start": current_date,
                    "end": period_end
                })
                current_date += timedelta(days=7)
                
        elif period_type == "monthly":
            # Monthly periods
            while current_date <= end_date:
                # Get the last day of the current month
                if current_date.month == 12:
                    next_month = date(current_date.year + 1, 1, 1)
                else:
                    next_month = date(current_date.year, current_date.month + 1, 1)
                
                last_day = next_month - timedelta(days=1)
                period_end = min(last_day, end_date)
                
                periods.append({
                    "start": current_date,
                    "end": period_end
                })
                
                # Move to the first day of the next month
                current_date = next_month
        
        return periods
    
    @staticmethod
    async def _get_call_trends(
        db: AsyncSession,
        organization_id: UUID,
        time_periods: List[Dict[str, date]]
    ) -> List[Dict[str, Any]]:
        """
        Get call trends for specified time periods.
        
        Args:
            db: Database session
            organization_id: Organization ID
            time_periods: List of time periods
            
        Returns:
            List[Dict[str, Any]]: Call trend data
        """
        trend_data = []
        
        for period in time_periods:
            start = period["start"]
            end = period["end"]
            
            # Convert to datetime for database comparison
            start_datetime = datetime.combine(start, datetime.min.time())
            end_datetime = datetime.combine(end, datetime.max.time())
            
            # Query calls for this period
            query = select(Call).where(
                Call.organization_id == organization_id,
                Call.created_at >= start_datetime,
                Call.created_at <= end_datetime
            )
            
            result = await db.execute(query)
            calls = result.scalars().all()
            
            # Calculate metrics
            total_count = len(calls)
            completed_count = len([call for call in calls if call.status == "Completed"])
            missed_count = len([call for call in calls if call.status == "Missed"])
            
            trend_data.append({
                "period_start": start.isoformat(),
                "period_end": end.isoformat(),
                "total_count": total_count,
                "completed_count": completed_count,
                "missed_count": missed_count,
                "completion_rate": (completed_count / total_count * 100) if total_count > 0 else 0
            })
        
        return trend_data
    
    @staticmethod
    async def _get_service_record_trends(
        db: AsyncSession,
        organization_id: UUID,
        time_periods: List[Dict[str, date]]
    ) -> List[Dict[str, Any]]:
        """
        Get service record trends for specified time periods.
        
        Args:
            db: Database session
            organization_id: Organization ID
            time_periods: List of time periods
            
        Returns:
            List[Dict[str, Any]]: Service record trend data
        """
        trend_data = []
        
        for period in time_periods:
            start = period["start"]
            end = period["end"]
            
            # Convert to datetime for database comparison
            start_datetime = datetime.combine(start, datetime.min.time())
            end_datetime = datetime.combine(end, datetime.max.time())
            
            # Query service records for this period
            query = select(ServiceRecord).where(
                ServiceRecord.organization_id == organization_id,
                ServiceRecord.created_at >= start_datetime,
                ServiceRecord.created_at <= end_datetime
            )
            
            result = await db.execute(query)
            records = result.scalars().all()
            
            # Calculate metrics
            total_count = len(records)
            completed_count = len([record for record in records if record.status == "Completed"])
            total_amount = sum(record.total_amount for record in records if record.total_amount)
            
            trend_data.append({
                "period_start": start.isoformat(),
                "period_end": end.isoformat(),
                "total_count": total_count,
                "completed_count": completed_count,
                "total_amount": total_amount,
                "avg_amount": total_amount / total_count if total_count > 0 else 0,
                "completion_rate": (completed_count / total_count * 100) if total_count > 0 else 0
            })
        
        return trend_data
    
    @staticmethod
    async def _get_revenue_trends(
        db: AsyncSession,
        organization_id: UUID,
        time_periods: List[Dict[str, date]]
    ) -> List[Dict[str, Any]]:
        """
        Get revenue trends for specified time periods.
        
        Args:
            db: Database session
            organization_id: Organization ID
            time_periods: List of time periods
            
        Returns:
            List[Dict[str, Any]]: Revenue trend data
        """
        trend_data = []
        
        for period in time_periods:
            start = period["start"]
            end = period["end"]
            
            # Convert to datetime for database comparison
            start_datetime = datetime.combine(start, datetime.min.time())
            end_datetime = datetime.combine(end, datetime.max.time())
            
            # Query service records for this period
            query = select(ServiceRecord).where(
                ServiceRecord.organization_id == organization_id,
                ServiceRecord.created_at >= start_datetime,
                ServiceRecord.created_at <= end_datetime
            )
            
            result = await db.execute(query)
            records = result.scalars().all()
            
            # Calculate revenue metrics
            total_revenue = sum(record.total_amount for record in records if record.total_amount)
            record_count = len(records)
            
            trend_data.append({
                "period_start": start.isoformat(),
                "period_end": end.isoformat(),
                "total_revenue": total_revenue,
                "record_count": record_count,
                "avg_revenue_per_record": total_revenue / record_count if record_count > 0 else 0
            })
        
        return trend_data
    
    @staticmethod
    async def _get_daily_distribution(
        calls: List[Call],
        start_date: date,
        end_date: date
    ) -> Dict[str, int]:
        """
        Get daily distribution of calls.
        
        Args:
            calls: List of calls
            start_date: Start date
            end_date: End date
            
        Returns:
            Dict[str, int]: Daily distribution of calls
        """
        # Initialize distribution with all dates in range
        distribution = {}
        current_date = start_date
        while current_date <= end_date:
            distribution[current_date.isoformat()] = 0
            current_date += timedelta(days=1)
        
        # Count calls by date
        for call in calls:
            if call.created_at:
                call_date = call.created_at.date()
                if start_date <= call_date <= end_date:
                    date_key = call_date.isoformat()
                    distribution[date_key] += 1
        
        return distribution 
    
    @staticmethod
    async def get_calls_summary_metrics(
        db: AsyncSession,
        organization_id: UUID
    ) -> Dict[str, Any]:
        """
        Get summary metrics for calls dashboard.
        
        Args:
            db: Database session
            organization_id: Organization ID
            
        Returns:
            Dict[str, Any]: Call summary metrics including:
                - total_count: Total number of calls (excluding demo calls)
                - completed_count: Number of calls in Completed status
                - avg_nps: Average NPS score for completed calls
                - detractors_count: Number of completed calls with NPS <= 5
        """
        # Query for all calls for this organization, excluding demo calls
        # Join with ServiceRecord to filter out demo calls
        query = select(Call).join(ServiceRecord).where(
            and_(
                Call.organization_id == organization_id,
                ServiceRecord.is_demo == False  # Exclude demo calls
            )
        )
        result = await db.execute(query)
        calls = result.scalars().all()
        
        # Filter calls by status
        completed_calls = [call for call in calls if call.status == "Completed"]
        
        # Count metrics
        total_count = len(calls)  # Total calls excluding demo calls
        completed_count = len(completed_calls)
        
        # NPS metrics for completed calls only
        nps_scores = [call.nps_score for call in completed_calls if call.nps_score is not None]
        avg_nps = round(sum(nps_scores) / len(nps_scores), 1) if nps_scores else 0
        
        # Detractors (NPS <= 5) - only from completed calls
        detractors = [score for score in nps_scores if score <= 5]
        detractors_count = len(detractors)
        
        return {
            "total_count": total_count,
            "completed_count": completed_count,
            "avg_nps": avg_nps,
            "detractors_count": detractors_count
        }

    @staticmethod
    async def get_calls_summary_metrics_with_trends(
        db: AsyncSession,
        organization_id: UUID
    ) -> Dict[str, Any]:
        """
        Get summary metrics for calls dashboard with 5-day interval trends for current month.
        
        Args:
            db: Database session
            organization_id: Organization ID
            
        Returns:
            Dict[str, Any]: Call summary metrics with trend data including:
                - total_count: Total number of calls (excluding demo calls)
                - completed_count: Number of calls in Completed status
                - avg_nps: Average NPS score for completed calls
                - detractors_count: Number of completed calls with NPS <= 5
                - trends: 5-day interval data for current month
                - month_over_month: Percentage changes compared to previous month
        """
        # Get current month start and end dates
        today = datetime.now().date()
        current_month_start = date(today.year, today.month, 1)
        
        # Calculate end of current month
        if today.month == 12:
            next_month = date(today.year + 1, 1, 1)
        else:
            next_month = date(today.year, today.month + 1, 1)
        current_month_end = next_month - timedelta(days=1)
        
        # Calculate previous month start and end dates
        if today.month == 1:
            prev_month_start = date(today.year - 1, 12, 1)
            prev_month_end = date(today.year - 1, 12, 31)
        else:
            prev_month_start = date(today.year, today.month - 1, 1)
            prev_month_end = date(today.year, today.month, 1) - timedelta(days=1)
        
        # Get current month metrics
        current_metrics = await AnalyticsService._get_monthly_metrics(
            db=db,
            organization_id=organization_id,
            start_date=current_month_start,
            end_date=current_month_end
        )
        
        # Get previous month metrics
        prev_metrics = await AnalyticsService._get_monthly_metrics(
            db=db,
            organization_id=organization_id,
            start_date=prev_month_start,
            end_date=prev_month_end
        )
        
        # Calculate month-over-month changes
        month_over_month = AnalyticsService._calculate_month_over_month_changes(
            current_metrics, prev_metrics
        )
        
        # Generate 5-day intervals for current month
        trends = await AnalyticsService._get_five_day_trends(
            db=db,
            organization_id=organization_id,
            start_date=current_month_start,
            end_date=current_month_end
        )
        
        return {
            "total_count": current_metrics["total_count"],
            "completed_count": current_metrics["completed_count"],
            "avg_nps": current_metrics["avg_nps"],
            "detractors_count": current_metrics["detractors_count"],
            "trends": trends,
            "month_over_month": month_over_month
        }

    @staticmethod
    async def _get_monthly_metrics(
        db: AsyncSession,
        organization_id: UUID,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """
        Get monthly metrics for a specific date range.
        
        Args:
            db: Database session
            organization_id: Organization ID
            start_date: Start date
            end_date: End date
            
        Returns:
            Dict[str, Any]: Monthly metrics
        """
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        # Query for all calls in the date range, excluding demo calls
        query = select(Call).join(ServiceRecord).where(
            and_(
                Call.organization_id == organization_id,
                ServiceRecord.is_demo == False,
                Call.created_at >= start_datetime,
                Call.created_at <= end_datetime
            )
        )
        result = await db.execute(query)
        calls = result.scalars().all()
        
        # Filter calls by status
        completed_calls = [call for call in calls if call.status == "Completed"]
        
        # Count metrics
        total_count = len(calls)
        completed_count = len(completed_calls)
        
        # NPS metrics for completed calls only
        nps_scores = [call.nps_score for call in completed_calls if call.nps_score is not None]
        avg_nps = round(sum(nps_scores) / len(nps_scores), 1) if nps_scores else 0
        
        # Detractors (NPS <= 5) - only from completed calls
        detractors = [score for score in nps_scores if score <= 5]
        detractors_count = len(detractors)
        
        return {
            "total_count": total_count,
            "completed_count": completed_count,
            "avg_nps": avg_nps,
            "detractors_count": detractors_count
        }

    @staticmethod
    def _calculate_month_over_month_changes(
        current_metrics: Dict[str, Any],
        prev_metrics: Dict[str, Any]
    ) -> Dict[str, Dict[str, Any]]:
        """
        Calculate month-over-month percentage changes.
        
        Args:
            current_metrics: Current month metrics
            prev_metrics: Previous month metrics
            
        Returns:
            Dict[str, Dict[str, Any]]: Month-over-month changes
        """
        def calculate_change(current: float, previous: float) -> Dict[str, Any]:
            if previous == 0:
                if current == 0:
                    return {"change": "0%", "changeType": "neutral", "hasData": False}
                else:
                    return {"change": "+∞%", "changeType": "positive", "hasData": True}
            
            change_percent = ((current - previous) / previous) * 100
            change_type = "positive" if change_percent >= 0 else "negative"
            
            # Format the change string
            if abs(change_percent) < 0.1:
                change_str = "0%"
            else:
                change_str = f"{'+' if change_percent >= 0 else ''}{change_percent:.1f}%"
            
            return {
                "change": change_str,
                "changeType": change_type,
                "hasData": True
            }
        
        return {
            "total_calls": calculate_change(
                current_metrics["total_count"], 
                prev_metrics["total_count"]
            ),
            "completed_calls": calculate_change(
                current_metrics["completed_count"], 
                prev_metrics["completed_count"]
            ),
            "nps": calculate_change(
                current_metrics["avg_nps"], 
                prev_metrics["avg_nps"]
            ),
            "detractors": calculate_change(
                current_metrics["detractors_count"], 
                prev_metrics["detractors_count"]
            )
        }

    @staticmethod
    async def _get_five_day_trends(
        db: AsyncSession,
        organization_id: UUID,
        start_date: date,
        end_date: date
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get 5-day interval trends for the current month.
        
        Args:
            db: Database session
            organization_id: Organization ID
            start_date: Start date of current month
            end_date: End date of current month
            
        Returns:
            Dict[str, List[Dict[str, Any]]]: Trend data for each metric
        """
        # Generate 5-day intervals
        intervals = []
        current_date = start_date
        
        while current_date <= end_date:
            interval_end = min(current_date + timedelta(days=4), end_date)
            intervals.append({
                "start": current_date,
                "end": interval_end,
                "label": f"{current_date.strftime('%b %d')} - {interval_end.strftime('%b %d')}"
            })
            current_date += timedelta(days=5)
        
        # Get data for each interval
        total_calls_trend = []
        completed_calls_trend = []
        nps_trend = []
        detractors_trend = []
        
        for interval in intervals:
            start_datetime = datetime.combine(interval["start"], datetime.min.time())
            end_datetime = datetime.combine(interval["end"], datetime.max.time())
            
            # Query calls for this interval
            query = select(Call).join(ServiceRecord).where(
                and_(
                    Call.organization_id == organization_id,
                    ServiceRecord.is_demo == False,
                    Call.created_at >= start_datetime,
                    Call.created_at <= end_datetime
                )
            )
            result = await db.execute(query)
            interval_calls = result.scalars().all()
            
            # Calculate metrics for this interval
            interval_total = len(interval_calls)
            interval_completed = len([call for call in interval_calls if call.status == "Completed"])
            
            # NPS for completed calls in this interval
            interval_nps_scores = [call.nps_score for call in interval_calls if call.status == "Completed" and call.nps_score is not None]
            interval_avg_nps = round(sum(interval_nps_scores) / len(interval_nps_scores), 1) if interval_nps_scores else 0
            
            # Detractors for this interval
            interval_detractors = len([score for score in interval_nps_scores if score <= 5])
            
            # Add to trends
            total_calls_trend.append({
                "name": interval["label"],
                "value": interval_total
            })
            
            completed_calls_trend.append({
                "name": interval["label"],
                "value": interval_completed
            })
            
            nps_trend.append({
                "name": interval["label"],
                "value": interval_avg_nps
            })
            
            detractors_trend.append({
                "name": interval["label"],
                "value": interval_detractors
            })
        
        return {
            "total_calls": total_calls_trend,
            "completed_calls": completed_calls_trend,
            "nps": nps_trend,
            "detractors": detractors_trend
        }

    @staticmethod
    async def get_feedback_insights(
        db: AsyncSession,
        organization_id: UUID
    ) -> Dict[str, Any]:
        """
        Get feedback insights for dashboard.
        
        Fetches positive mentions and areas to improve from completed calls,
        aggregates by frequency, and supplements with organization tags when needed.
        
        Args:
            db: Database session
            organization_id: Organization ID
            
        Returns:
            Dict[str, Any]: Feedback insights containing:
                - positive_mentions: Top 5 positive feedback items
                - areas_to_improve: Top 5 improvement areas
        """
        # Query completed calls with their feedback
        completed_calls_query = select(Call).where(
            Call.organization_id == organization_id,
            Call.status == "Completed"
        )
        calls_result = await db.execute(completed_calls_query)
        completed_calls = calls_result.scalars().all()
        
        if not completed_calls:
            # No completed calls, use organization tags as fallback
            return await AnalyticsService._get_fallback_insights(db, organization_id)
        
        # Get call IDs for feedback query
        call_ids = [call.id for call in completed_calls]
        
        # Query feedback for completed calls
        feedback_query = select(CallFeedback).where(
            CallFeedback.call_id.in_(call_ids)
        )
        feedback_result = await db.execute(feedback_query)
        all_feedback = feedback_result.scalars().all()
        
        if not all_feedback:
            # No feedback data, use organization tags as fallback
            return await AnalyticsService._get_fallback_insights(db, organization_id)
        
        # Separate positive and negative feedback
        positive_feedback = [f for f in all_feedback if f.type == "positives"]
        negative_feedback = [f for f in all_feedback if f.type == "detractors"]
        
        # Aggregate and process feedback
        positive_insights = await AnalyticsService._process_feedback_data(
            positive_feedback, "positive"
        )
        negative_insights = await AnalyticsService._process_feedback_data(
            negative_feedback, "negative"
        )
        
        # Fill remaining slots with organization tags if needed
        if len(positive_insights) < 5:
            positive_insights = await AnalyticsService._fill_with_tags(
                db, organization_id, positive_insights, "areas_to_focus", 5
            )
        
        if len(negative_insights) < 5:
            negative_insights = await AnalyticsService._fill_with_tags(
                db, organization_id, negative_insights, "areas_to_focus", 5
            )
        
        return {
            "positive_mentions": positive_insights[:5],
            "areas_to_improve": negative_insights[:5]
        }
    
    @staticmethod
    async def _process_feedback_data(
        feedback_items: List[CallFeedback],
        feedback_type: str
    ) -> List[Dict[str, Any]]:
        """
        Process feedback data and aggregate by content.
        
        Args:
            feedback_items: List of CallFeedback objects
            feedback_type: Type of feedback for logging
            
        Returns:
            List[Dict[str, Any]]: Processed feedback data
        """
        if not feedback_items:
            return []
        
        # Count occurrences of each feedback item
        feedback_counts = {}
        total_feedback = 0
        
        for feedback in feedback_items:
            if feedback.kpis:
                # Handle both string and JSON formats
                if isinstance(feedback.kpis, str):
                    content = feedback.kpis.strip().strip('"')
                else:
                    # If it's already parsed JSON, convert to string
                    content = str(feedback.kpis).strip().strip('"')
                
                if content and len(content) > 2:  # Avoid empty or very short strings
                    feedback_counts[content] = feedback_counts.get(content, 0) + 1
                    total_feedback += 1
        
        if total_feedback == 0:
            return []
        
        # Sort by count and create result
        sorted_feedback = sorted(
            feedback_counts.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        result = []
        for content, count in sorted_feedback[:5]:
            percentage = round((count / total_feedback) * 100, 0)
            result.append({
                "topic": content,
                "count": count,
                "percentage": int(percentage)
            })
        
        return result
    
    @staticmethod
    async def _fill_with_tags(
        db: AsyncSession,
        organization_id: UUID,
        existing_insights: List[Dict[str, Any]],
        tag_type: str,
        target_count: int
    ) -> List[Dict[str, Any]]:
        """
        Fill remaining insight slots with organization tags.
        
        Args:
            db: Database session
            organization_id: Organization ID
            existing_insights: Existing insights to supplement
            tag_type: Type of tags to fetch
            target_count: Target number of insights
            
        Returns:
            List[Dict[str, Any]]: Insights supplemented with tags
        """
        if len(existing_insights) >= target_count:
            return existing_insights
        
        # Get organization tags
        tags_query = select(Tag).where(
            Tag.organization_id == organization_id,
            Tag.type == tag_type
        )
        tags_result = await db.execute(tags_query)
        tags = tags_result.scalars().all()
        
        # Add tags to fill remaining slots
        result = existing_insights.copy()
        existing_topics = {insight["topic"].lower() for insight in existing_insights}
        
        for tag in tags:
            if len(result) >= target_count:
                break
            
            # Avoid duplicates
            if tag.name.lower() not in existing_topics:
                result.append({
                    "topic": tag.name,
                    "count": 0,  # Default count for tag-based items
                    "percentage": 0  # Default percentage for tag-based items
                })
        
        return result
    
    @staticmethod
    async def _get_fallback_insights(
        db: AsyncSession,
        organization_id: UUID
    ) -> Dict[str, Any]:
        """
        Get fallback insights using only organization tags.
        
        Args:
            db: Database session
            organization_id: Organization ID
            
        Returns:
            Dict[str, Any]: Fallback insights
        """
        # Get organization tags for areas to focus
        tags_query = select(Tag).where(
            Tag.organization_id == organization_id,
            Tag.type == "areas_to_focus"
        )
        tags_result = await db.execute(tags_query)
        tags = tags_result.scalars().all()
        
        # Convert tags to insight format
        tag_insights = []
        for tag in tags[:5]:
            tag_insights.append({
                "topic": tag.name,
                "count": 0,
                "percentage": 0
            })
        
        # Fill empty slots if less than 5 tags
        default_positive = [
            "Professional Service", "Quick Response", "Knowledgeable Staff", 
            "Fair Pricing", "Clean Facility"
        ]
        default_negative = [
            "Wait Time", "Communication", "Follow-up", 
            "Scheduling", "Pricing Clarity"
        ]
        
        positive_insights = []
        for i, topic in enumerate(default_positive[:5]):
            positive_insights.append({
                "topic": topic,
                "count": 0,
                "percentage": 0
            })
        
        # Use tags for areas to improve, supplement with defaults if needed
        areas_to_improve = tag_insights.copy()
        while len(areas_to_improve) < 5:
            remaining_index = len(areas_to_improve)
            if remaining_index < len(default_negative):
                areas_to_improve.append({
                    "topic": default_negative[remaining_index],
                    "count": 0,
                    "percentage": 0
                })
            else:
                break
        
        return {
            "positive_mentions": positive_insights,
            "areas_to_improve": areas_to_improve[:5]
        }