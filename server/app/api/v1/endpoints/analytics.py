"""
Analytics API endpoints.
"""

from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_organization, get_tenant_db
from app.models import Organization
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/dashboard", response_model=Dict[str, Any])
async def get_dashboard_metrics(
    start_date: Optional[date] = Query(None, description="Start date for metrics"),
    end_date: Optional[date] = Query(None, description="End date for metrics"),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get dashboard metrics.
    
    Args:
        start_date: Start date for metrics (defaults to 30 days ago)
        end_date: End date for metrics (defaults to today)
        organization: Current organization
        db: Database session
        
    Returns:
        Dict[str, Any]: Dashboard metrics
    """
    # Set default date range if not provided
    if start_date is None:
        start_date = datetime.now().date() - timedelta(days=30)
    
    if end_date is None:
        end_date = datetime.now().date()
    
    return await AnalyticsService.get_dashboard_metrics(
        organization_id=organization.id,
        start_date=start_date,
        end_date=end_date,
        db=db
    )


@router.get("/calls", response_model=Dict[str, Any])
async def get_call_metrics(
    start_date: Optional[date] = Query(None, description="Start date for metrics"),
    end_date: Optional[date] = Query(None, description="End date for metrics"),
    campaign_id: Optional[int] = Query(None, description="Filter by campaign ID"),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get call metrics.
    
    Args:
        start_date: Start date for metrics (defaults to 30 days ago)
        end_date: End date for metrics (defaults to today)
        campaign_id: Filter by campaign ID
        organization: Current organization
        db: Database session
        
    Returns:
        Dict[str, Any]: Call metrics
    """
    # Set default date range if not provided
    if start_date is None:
        start_date = datetime.now().date() - timedelta(days=30)
    
    if end_date is None:
        end_date = datetime.now().date()
    
    return await AnalyticsService.get_call_metrics(
        organization_id=organization.id,
        start_date=start_date,
        end_date=end_date,
        campaign_id=campaign_id,
        db=db
    )


@router.get("/service-records", response_model=Dict[str, Any])
async def get_service_record_metrics(
    start_date: Optional[date] = Query(None, description="Start date for metrics"),
    end_date: Optional[date] = Query(None, description="End date for metrics"),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get service record metrics.
    
    Args:
        start_date: Start date for metrics (defaults to 30 days ago)
        end_date: End date for metrics (defaults to today)
        organization: Current organization
        db: Database session
        
    Returns:
        Dict[str, Any]: Service record metrics
    """
    # Set default date range if not provided
    if start_date is None:
        start_date = datetime.now().date() - timedelta(days=30)
    
    if end_date is None:
        end_date = datetime.now().date()
    
    return await AnalyticsService.get_service_record_metrics(
        organization_id=organization.id,
        start_date=start_date,
        end_date=end_date,
        db=db
    )


@router.get("/campaigns/{campaign_id}", response_model=Dict[str, Any])
async def get_campaign_analytics(
    campaign_id: int = Path(..., ge=1),
    start_date: Optional[date] = Query(None, description="Start date for metrics"),
    end_date: Optional[date] = Query(None, description="End date for metrics"),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get analytics for a specific campaign.
    
    Args:
        campaign_id: Campaign ID
        start_date: Start date for metrics (defaults to campaign start date)
        end_date: End date for metrics (defaults to today)
        organization: Current organization
        db: Database session
        
    Returns:
        Dict[str, Any]: Campaign analytics
    """
    # Default end_date to today if not provided
    if end_date is None:
        end_date = datetime.now().date()
    
    return await AnalyticsService.get_campaign_analytics(
        campaign_id=campaign_id,
        organization_id=organization.id,
        start_date=start_date,
        end_date=end_date,
        db=db
    )


@router.get("/trends", response_model=Dict[str, Any])
async def get_trend_analysis(
    metric_type: str = Query(..., description="Type of metric to analyze (calls, service_records, revenue)"),
    time_period: str = Query("daily", description="Time period for analysis (daily, weekly, monthly)"),
    start_date: Optional[date] = Query(None, description="Start date for analysis"),
    end_date: Optional[date] = Query(None, description="End date for analysis"),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get trend analysis for specified metrics.
    
    Args:
        metric_type: Type of metric to analyze
        time_period: Time period for analysis
        start_date: Start date for analysis (defaults to 90 days ago)
        end_date: End date for analysis (defaults to today)
        organization: Current organization
        db: Database session
        
    Returns:
        Dict[str, Any]: Trend analysis
    """
    # Set default date range if not provided
    if start_date is None:
        start_date = datetime.now().date() - timedelta(days=90)
    
    if end_date is None:
        end_date = datetime.now().date()
    
    return await AnalyticsService.get_trend_analysis(
        organization_id=organization.id,
        metric_type=metric_type,
        time_period=time_period,
        start_date=start_date,
        end_date=end_date,
        db=db
    ) 


@router.get("/calls/summary", response_model=Dict[str, Any])
async def get_calls_summary_metrics(
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get summary metrics for calls dashboard.
    
    Args:
        organization: Current organization
        db: Database session
        
    Returns:
        Dict[str, Any]: Call summary metrics including:
            - ready_count: Number of calls in Ready/Scheduled status
            - missed_count: Number of calls in Failed/Missed status
            - completed_count: Number of calls in Completed status
            - avg_nps: Average NPS score for completed calls
            - promoters_count: Number of completed calls with NPS >= 7
            - detractors_count: Number of completed calls with NPS <= 5
    """
    return await AnalyticsService.get_calls_summary_metrics(
        organization_id=organization.id,
        db=db
    ) 