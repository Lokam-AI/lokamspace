"""
Metrics API endpoints for KPI dashboard.
"""

from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select, func, case, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_organization, get_tenant_db
from app.models import Organization, Call, CallFeedback, ServiceRecord

router = APIRouter()


# Response models
class MetricsKPIResponse(BaseModel):
    """Response model for KPI metrics."""
    total_minutes: float
    total_calls: int
    total_spend: float
    average_nps: Optional[float]
    call_status_breakdown: Dict[str, int]
    call_types_breakdown: Dict[str, int]
    cost_by_category: Dict[str, float]


class CallAnalysisChartsResponse(BaseModel):
    """Response model for call analysis charts."""
    reason_call_ended: List[Dict[str, Any]]
    avg_duration_by_type: List[Dict[str, Any]]
    cost_breakdown: List[Dict[str, Any]]


@router.get("/dashboard-kpis", response_model=MetricsKPIResponse)
async def get_dashboard_kpis(
    date_range: str = Query("7d", description="Date range: 7d, 30d, 90d, or custom"),
    start_date: Optional[date] = Query(None, description="Custom start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Custom end date (YYYY-MM-DD)"),
    group_by: Optional[str] = Query(None, description="Group by: Day, Month, Quarter, Yearly"),
    filter_type: Optional[str] = Query(None, description="Filter by call type"),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get dashboard KPI metrics.
    
    Args:
        date_range: Predefined date range (7d, 30d, 90d)
        start_date: Custom start date
        end_date: Custom end date
        group_by: Group by period (Day, Month, Quarter, Yearly)
        filter_type: Filter by specific call type
        organization: Current organization
        db: Database session
        
    Returns:
        MetricsKPIResponse: Dashboard KPI metrics
    """
    # Calculate date range
    end_dt = end_date or datetime.now().date()
    
    if start_date:
        start_dt = start_date
    else:
        days_map = {"7d": 7, "30d": 30, "90d": 90}
        days = days_map.get(date_range, 7)
        start_dt = end_dt - timedelta(days=days)
    
    # Convert to datetime for filtering
    start_datetime = datetime.combine(start_dt, datetime.min.time())
    end_datetime = datetime.combine(end_dt, datetime.max.time())
    
    # Base filter for organization and date range
    base_filter_conditions = [
        Call.organization_id == organization.id,
        Call.created_at >= start_datetime,
        Call.created_at <= end_datetime
    ]
    
    # Add filter_type condition if provided
    if filter_type:
        base_filter_conditions.append(Call.call_reason == filter_type)
    
    base_filter = and_(*base_filter_conditions)
    
    # Note: group_by parameter affects the aggregation period but for KPIs 
    # we still show totals - the grouping is more relevant for trends/charts
    
    # 1. Total Call Minutes
    total_minutes_result = await db.execute(
        select(func.coalesce(func.sum(Call.duration_sec), 0))
        .where(base_filter)
    )
    total_seconds = total_minutes_result.scalar() or 0
    total_minutes = round(total_seconds / 60.0, 2)
    
    # 2. Total Calls
    total_calls_result = await db.execute(
        select(func.count(Call.id))
        .where(base_filter)
    )
    total_calls = total_calls_result.scalar() or 0
    
    # 3. Total Spend (cost)
    total_spend_result = await db.execute(
        select(func.coalesce(func.sum(Call.cost), 0))
        .where(base_filter)
    )
    total_spend = float(total_spend_result.scalar() or 0)
    
    # 4. Average NPS Score
    nps_result = await db.execute(
        select(func.avg(Call.nps_score))
        .where(
            and_(
                base_filter,
                Call.nps_score.isnot(None)
            )
        )
    )
    average_nps = nps_result.scalar()
    if average_nps is not None:
        average_nps = round(float(average_nps), 1)
    
    # 5. Call Status Breakdown
    status_breakdown_result = await db.execute(
        select(
            Call.status,
            func.count(Call.id).label('count')
        )
        .where(base_filter)
        .group_by(Call.status)
    )
    call_status_breakdown = {
        row.status: row.count for row in status_breakdown_result
    }
    
    # 6. Call Types Breakdown (direction: inbound/outbound)
    types_breakdown_result = await db.execute(
        select(
            Call.direction,
            func.count(Call.id).label('count')
        )
        .where(base_filter)
        .group_by(Call.direction)
    )
    call_types_breakdown = {
        row.direction.title(): row.count for row in types_breakdown_result
    }
    
    # 7. Cost by Category (based on call reason/service type)
    # First get cost by service type from service records
    cost_by_service_result = await db.execute(
        select(
            ServiceRecord.service_type,
            func.coalesce(func.sum(Call.cost), 0).label('total_cost')
        )
        .join(Call, Call.service_record_id == ServiceRecord.id)
        .where(base_filter)
        .group_by(ServiceRecord.service_type)
    )
    
    cost_by_category = {}
    for row in cost_by_service_result:
        service_type = row.service_type or "Other"
        cost_by_category[service_type] = float(row.total_cost or 0)
    
    # If no service type data, categorize by call reason
    if not cost_by_category:
        cost_by_reason_result = await db.execute(
            select(
                Call.call_reason,
                func.coalesce(func.sum(Call.cost), 0).label('total_cost')
            )
            .where(base_filter)
            .group_by(Call.call_reason)
        )
        
        for row in cost_by_reason_result:
            reason = row.call_reason or "General"
            cost_by_category[reason] = float(row.total_cost or 0)
    
    # Ensure we have at least some data
    if not cost_by_category and total_spend > 0:
        cost_by_category["General"] = total_spend
    
    return MetricsKPIResponse(
        total_minutes=total_minutes,
        total_calls=total_calls,
        total_spend=total_spend,
        average_nps=average_nps,
        call_status_breakdown=call_status_breakdown,
        call_types_breakdown=call_types_breakdown,
        cost_by_category=cost_by_category
    )


@router.get("/call-trends", response_model=Dict[str, Any])
async def get_call_trends(
    date_range: str = Query("30d", description="Date range: 7d, 30d, 90d"),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get call trends over time for charts.
    
    Args:
        date_range: Date range for trends
        organization: Current organization
        db: Database session
        
    Returns:
        Dict: Call trends data for charts
    """
    # Calculate date range
    days_map = {"7d": 7, "30d": 30, "90d": 90}
    days = days_map.get(date_range, 30)
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)
    
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())
    
    # Get daily call counts and minutes
    daily_stats_result = await db.execute(
        select(
            func.date(Call.created_at).label('call_date'),
            func.count(Call.id).label('call_count'),
            func.coalesce(func.sum(Call.duration_sec), 0).label('total_seconds'),
            func.coalesce(func.sum(Call.cost), 0).label('total_cost')
        )
        .where(
            and_(
                Call.organization_id == organization.id,
                Call.created_at >= start_datetime,
                Call.created_at <= end_datetime
            )
        )
        .group_by(func.date(Call.created_at))
        .order_by(func.date(Call.created_at))
    )
    
    trends_data = []
    for row in daily_stats_result:
        trends_data.append({
            "date": row.call_date.strftime("%Y-%m-%d"),
            "calls": row.call_count,
            "minutes": round((row.total_seconds or 0) / 60.0, 2),
            "cost": float(row.total_cost or 0)
        })
    
    return {
        "trends": trends_data,
        "date_range": date_range,
        "total_days": days
    }


@router.get("/performance-summary", response_model=Dict[str, Any])
async def get_performance_summary(
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get performance summary comparing current period to previous period.
    
    Args:
        organization: Current organization
        db: Database session
        
    Returns:
        Dict: Performance comparison data
    """
    now = datetime.now()
    
    # Current 30 days
    current_start = now - timedelta(days=30)
    current_end = now
    
    # Previous 30 days
    previous_start = now - timedelta(days=60)
    previous_end = now - timedelta(days=30)
    
    # Get current period stats
    current_stats = await db.execute(
        select(
            func.count(Call.id).label('calls'),
            func.coalesce(func.sum(Call.duration_sec), 0).label('seconds'),
            func.coalesce(func.sum(Call.cost), 0).label('cost'),
            func.avg(Call.nps_score).label('avg_nps')
        )
        .where(
            and_(
                Call.organization_id == organization.id,
                Call.created_at >= current_start,
                Call.created_at <= current_end
            )
        )
    )
    current = current_stats.first()
    
    # Get previous period stats
    previous_stats = await db.execute(
        select(
            func.count(Call.id).label('calls'),
            func.coalesce(func.sum(Call.duration_sec), 0).label('seconds'),
            func.coalesce(func.sum(Call.cost), 0).label('cost'),
            func.avg(Call.nps_score).label('avg_nps')
        )
        .where(
            and_(
                Call.organization_id == organization.id,
                Call.created_at >= previous_start,
                Call.created_at <= previous_end
            )
        )
    )
    previous = previous_stats.first()
    
    def calculate_change(current_val, previous_val):
        if not previous_val or previous_val == 0:
            return 0.0
        return round(((current_val - previous_val) / previous_val) * 100, 1)
    
    return {
        "current_period": {
            "calls": current.calls or 0,
            "minutes": round((current.seconds or 0) / 60.0, 2),
            "cost": float(current.cost or 0),
            "avg_nps": round(float(current.avg_nps or 0), 1) if current.avg_nps else None
        },
        "previous_period": {
            "calls": previous.calls or 0,
            "minutes": round((previous.seconds or 0) / 60.0, 2),
            "cost": float(previous.cost or 0),
            "avg_nps": round(float(previous.avg_nps or 0), 1) if previous.avg_nps else None
        },
        "changes": {
            "calls_change": calculate_change(current.calls or 0, previous.calls or 0),
            "minutes_change": calculate_change(current.seconds or 0, previous.seconds or 0),
            "cost_change": calculate_change(float(current.cost or 0), float(previous.cost or 0)),
            "nps_change": calculate_change(
                float(current.avg_nps or 0), 
                float(previous.avg_nps or 0)
            ) if current.avg_nps and previous.avg_nps else 0.0
        }
    }


@router.get("/call-analysis-charts", response_model=CallAnalysisChartsResponse)
async def get_call_analysis_charts(
    date_range: str = Query("30d", description="Date range: 7d, 30d, 90d, or custom"),
    start_date: Optional[date] = Query(None, description="Custom start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Custom end date (YYYY-MM-DD)"),
    group_by: Optional[str] = Query(None, description="Group by: Day, Month, Quarter, Yearly"),
    filter_type: Optional[str] = Query(None, description="Filter by call type"),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get call analysis charts data.
    
    Args:
        date_range: Predefined date range (7d, 30d, 90d)
        start_date: Custom start date
        end_date: Custom end date
        group_by: Group by period (Day, Month, Quarter, Yearly)
        filter_type: Filter by specific call type
        organization: Current organization
        db: Database session
        
    Returns:
        CallAnalysisChartsResponse: Call analysis charts data
    """
    # Calculate date range
    end_dt = end_date or datetime.now().date()
    
    if start_date:
        start_dt = start_date
    else:
        days_map = {"7d": 7, "30d": 30, "90d": 90}
        days = days_map.get(date_range, 30)
        start_dt = end_dt - timedelta(days=days)
    
    # Convert to datetime for filtering
    start_datetime = datetime.combine(start_dt, datetime.min.time())
    end_datetime = datetime.combine(end_dt, datetime.max.time())
    
    # Base filter for organization and date range
    base_filter_conditions = [
        Call.organization_id == organization.id,
        Call.created_at >= start_datetime,
        Call.created_at <= end_datetime
    ]
    
    # Add filter_type condition if provided
    if filter_type:
        base_filter_conditions.append(Call.call_reason == filter_type)
    
    base_filter = and_(*base_filter_conditions)
    
    # Note: group_by parameter is not used in this endpoint since we're generating 
    # summary charts, not time-series data. For time-series grouping, use the 
    # call-trends endpoint.
    
    # 1. Reason Call Ended Chart
    reason_call_ended_result = await db.execute(
        select(
            Call.ended_reason,
            func.count(Call.id).label('count')
        )
        .where(
            and_(
                base_filter,
                Call.ended_reason.isnot(None)
            )
        )
        .group_by(Call.ended_reason)
        .order_by(func.count(Call.id).desc())
    )
    
    reason_call_ended = []
    color_map = {
        "Customer Ended": "#3b82f6",
        "Assistant Ended": "#10b981", 
        "Transfer Failed": "#f59e0b",
        "Error": "#ef4444",
        "Timeout": "#8b5cf6",
        "Other": "#6b7280"
    }
    
    for row in reason_call_ended_result:
        reason = row.ended_reason or "Other"
        color = color_map.get(reason, "#6b7280")
        reason_call_ended.append({
            "reason": reason,
            "count": row.count,
            "color": color
        })
    
    # If no data, provide default
    if not reason_call_ended:
        reason_call_ended = [
            {"reason": "Customer Ended", "count": 0, "color": "#3b82f6"},
            {"reason": "Assistant Ended", "count": 0, "color": "#10b981"},
            {"reason": "Transfer Failed", "count": 0, "color": "#f59e0b"}
        ]
    
    # 2. Average Duration by Type Chart
    # Group by call_reason or service_type
    type_expr = func.coalesce(Call.call_reason, ServiceRecord.service_type, "General")
    avg_duration_result = await db.execute(
        select(
            type_expr.label('type'),
            func.avg(Call.duration_sec).label('avg_duration_sec'),
            func.count(Call.id).label('count')
        )
        .outerjoin(ServiceRecord, Call.service_record_id == ServiceRecord.id)
        .where(
            and_(
                base_filter,
                Call.duration_sec.isnot(None),
                Call.duration_sec > 0
            )
        )
        .group_by(type_expr)
        .having(func.count(Call.id) > 0)
        .order_by(func.avg(Call.duration_sec).desc())
    )
    
    avg_duration_by_type = []
    type_color_map = {
        "Feedback Calls": "#3b82f6",
        "Bookings": "#10b981",
        "Inquiries": "#f59e0b",
        "General": "#8b5cf6"
    }
    
    for row in avg_duration_result:
        call_type = row.type or "General"
        # Map service types to chart-friendly names
        if "feedback" in call_type.lower():
            call_type = "Feedback Calls"
        elif "booking" in call_type.lower() or "appointment" in call_type.lower():
            call_type = "Bookings"
        elif "inquiry" in call_type.lower() or "question" in call_type.lower():
            call_type = "Inquiries"
        
        color = type_color_map.get(call_type, "#8b5cf6")
        avg_duration_minutes = round(float(row.avg_duration_sec or 0) / 60.0, 1)
        
        avg_duration_by_type.append({
            "type": call_type,
            "duration": avg_duration_minutes,
            "color": color
        })
    
    # If no data, provide default
    if not avg_duration_by_type:
        avg_duration_by_type = [
            {"type": "Feedback Calls", "duration": 0.0, "color": "#3b82f6"},
            {"type": "Bookings", "duration": 0.0, "color": "#10b981"},
            {"type": "Inquiries", "duration": 0.0, "color": "#f59e0b"}
        ]
    
    # 3. Cost Breakdown by Type Chart
    cost_type_expr = func.coalesce(Call.call_reason, ServiceRecord.service_type, "General")
    cost_breakdown_result = await db.execute(
        select(
            cost_type_expr.label('type'),
            func.coalesce(func.sum(Call.cost), 0).label('total_cost'),
            func.count(Call.id).label('count')
        )
        .outerjoin(ServiceRecord, Call.service_record_id == ServiceRecord.id)
        .where(
            and_(
                base_filter,
                Call.cost.isnot(None),
                Call.cost > 0
            )
        )
        .group_by(cost_type_expr)
        .having(func.count(Call.id) > 0)
        .order_by(func.coalesce(func.sum(Call.cost), 0).desc())
    )
    
    cost_breakdown = []
    total_cost = 0.0
    
    # Convert result to list so we can iterate twice
    cost_breakdown_rows = cost_breakdown_result.fetchall()
    
    # First pass to calculate total cost
    for row in cost_breakdown_rows:
        total_cost += float(row.total_cost or 0)
    
    # Second pass to calculate percentages
    for row in cost_breakdown_rows:
        call_type = row.type or "General"
        # Map service types to chart-friendly names
        if "feedback" in call_type.lower():
            call_type = "Feedback Calls"
        elif "booking" in call_type.lower() or "appointment" in call_type.lower():
            call_type = "Bookings"
        elif "inquiry" in call_type.lower() or "question" in call_type.lower():
            call_type = "Inquiries"
        
        cost = float(row.total_cost or 0)
        percentage = round((cost / total_cost) * 100, 1) if total_cost > 0 else 0
        
        cost_breakdown.append({
            "type": call_type,
            "cost": round(cost, 2),
            "percentage": percentage
        })
    
    # If no data, provide default
    if not cost_breakdown:
        cost_breakdown = [
            {"type": "Feedback Calls", "cost": 0.0, "percentage": 0},
            {"type": "Bookings", "cost": 0.0, "percentage": 0},
            {"type": "Inquiries", "cost": 0.0, "percentage": 0}
        ]
    
    return CallAnalysisChartsResponse(
        reason_call_ended=reason_call_ended,
        avg_duration_by_type=avg_duration_by_type,
        cost_breakdown=cost_breakdown
    )
