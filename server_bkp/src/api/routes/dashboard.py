from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, timedelta
from typing import List, Dict, Any
from ...db.base import User, ServiceRecord, Call, OrganizationMetric, CallMetricScore
from ...db.session import get_db
from pydantic import BaseModel
from ..dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

class DashboardStats(BaseModel):
    total_calls: int
    completed_calls: int
    average_rating: float
    detractors_count: int
    service_feedback_breakdown: dict
    ready_for_call_count: int

class CustomerBase(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    vehicle_number: str

@router.get("/overview")
async def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get overview statistics for the dashboard"""
    
    # Get total service records
    total_services = db.query(func.count(ServiceRecord.id)).filter(
        ServiceRecord.organization_id == current_user.organization_id
    ).scalar()
    
    # Get total calls
    total_calls = db.query(func.count(Call.id)).filter(
        Call.organization_id == current_user.organization_id
    ).scalar()
    
    # Get completed calls
    completed_calls = db.query(func.count(Call.id)).filter(
        Call.organization_id == current_user.organization_id,
        Call.status == "COMPLETED"
    ).scalar()
    
    # Get average NPS score
    avg_nps = db.query(func.avg(ServiceRecord.nps_score)).filter(
        ServiceRecord.organization_id == current_user.organization_id
    ).scalar() or 0
    
    # Get recent service records
    recent_services = db.query(ServiceRecord).filter(
        ServiceRecord.organization_id == current_user.organization_id
    ).order_by(ServiceRecord.service_date.desc()).limit(5).all()
    
    # Get metric scores
    metric_scores = db.query(
        OrganizationMetric.name,
        func.avg(CallMetricScore.score).label('average_score')
    ).join(
        CallMetricScore,
        OrganizationMetric.id == CallMetricScore.metric_id
    ).join(
        Call,
        CallMetricScore.call_id == Call.id
    ).filter(
        Call.organization_id == current_user.organization_id
    ).group_by(
        OrganizationMetric.name
    ).all()
    
    return {
        "total_services": total_services,
        "total_calls": total_calls,
        "completed_calls": completed_calls,
        "completion_rate": (completed_calls / total_calls * 100) if total_calls > 0 else 0,
        "average_nps": round(avg_nps, 2),
        "recent_services": [
            {
                "id": service.id,
                "customer_name": service.customer_name,
                "service_type": service.service_type,
                "service_date": service.service_date,
                "nps_score": service.nps_score
            }
            for service in recent_services
        ],
        "metric_scores": [
            {
                "metric": score.name,
                "average_score": round(score.average_score, 2) if score.average_score else 0
            }
            for score in metric_scores
        ]
    }

@router.get("/metrics")
async def get_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed metrics for the dashboard"""
    
    # Get metrics for the last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    # Daily service counts
    daily_services = db.query(
        func.date(ServiceRecord.service_date).label('date'),
        func.count(ServiceRecord.id).label('count')
    ).filter(
        ServiceRecord.organization_id == current_user.organization_id,
        ServiceRecord.service_date >= thirty_days_ago
    ).group_by(
        func.date(ServiceRecord.service_date)
    ).all()
    
    # Daily call completion rates
    daily_calls = db.query(
        func.date(Call.call_started_at).label('date'),
        func.count(Call.id).label('total'),
        func.sum(case((Call.status == "COMPLETED", 1), else_=0)).label('completed')
    ).filter(
        Call.organization_id == current_user.organization_id,
        Call.call_started_at >= thirty_days_ago
    ).group_by(
        func.date(Call.call_started_at)
    ).all()
    
    # Service type distribution
    service_types = db.query(
        ServiceRecord.service_type,
        func.count(ServiceRecord.id).label('count')
    ).filter(
        ServiceRecord.organization_id == current_user.organization_id
    ).group_by(
        ServiceRecord.service_type
    ).all()
    
    return {
        "daily_services": [
            {
                "date": str(day.date),
                "count": day.count
            }
            for day in daily_services
        ],
        "daily_calls": [
            {
                "date": str(day.date),
                "total": day.total,
                "completed": day.completed,
                "completion_rate": (day.completed / day.total * 100) if day.total > 0 else 0
            }
            for day in daily_calls
        ],
        "service_types": [
            {
                "type": st.service_type,
                "count": st.count
            }
            for st in service_types
        ]
    }

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for the last month."""
    one_month_ago = datetime.utcnow() - timedelta(days=180)
    
    # Get organization's customers
    customers = db.query(Customer).filter(
        Customer.organization_id == current_user.organization_id,
        Customer.is_active == True
    ).all()
    
    # Get call statistics
    calls = db.query(CallInteraction).join(
        ServiceRecord
    ).join(
        Customer
    ).filter(
        Customer.organization_id == current_user.organization_id,
        CallInteraction.call_date >= one_month_ago
    ).all()
    # Get completed calls (previously surveys)
    completed_calls_list = [c for c in calls if c.status == 'completed' and c.completed_at and c.completed_at >= one_month_ago]
    
    # Calculate statistics
    total_calls = len(calls)
    completed_calls = len([c for c in calls if c.status == 'completed'])
    
    # Calculate average rating and detractors
    # Calculate average rating and detractors, handling null values
    ratings = [c.overall_score for c in completed_calls_list if c.overall_score is not None]
    average_rating = sum(ratings) / len(ratings) if ratings else 0
    detractors = len([r for r in ratings if r <= 6])  # Assuming NPS scale
    
    # Service feedback breakdown with null handling
    feedback_breakdown = {
        'timeliness': sum(c.timeliness_score for c in completed_calls_list if c.timeliness_score is not None) / len([c for c in completed_calls_list if c.timeliness_score is not None]) if any(c.timeliness_score is not None for c in completed_calls_list) else 0,
        'cleanliness': sum(c.cleanliness_score for c in completed_calls_list if c.cleanliness_score is not None) / len([c for c in completed_calls_list if c.cleanliness_score is not None]) if any(c.cleanliness_score is not None for c in completed_calls_list) else 0,
        'advisor_helpfulness': sum(c.advisor_helpfulness_score for c in completed_calls_list if c.advisor_helpfulness_score is not None) / len([c for c in completed_calls_list if c.advisor_helpfulness_score is not None]) if any(c.advisor_helpfulness_score is not None for c in completed_calls_list) else 0,
        'work_quality': sum(c.work_quality_score for c in completed_calls_list if c.work_quality_score is not None) / len([c for c in completed_calls_list if c.work_quality_score is not None]) if any(c.work_quality_score is not None for c in completed_calls_list) else 0,
        'recommendation': sum(c.recommendation_score for c in completed_calls_list if c.recommendation_score is not None) / len([c for c in completed_calls_list if c.recommendation_score is not None]) if any(c.recommendation_score is not None for c in completed_calls_list) else 0
    }
    ratings = [c.overall_score for c in completed_calls_list if c.overall_score is not None]
    average_rating = sum(ratings) / len(ratings) if ratings else 0
    detractors = len([r for r in ratings if r <= 6])  # Assuming NPS scale
    
    # Service feedback breakdown
    feedback_breakdown = {
        'timeliness': sum(c.timeliness_score for c in completed_calls_list if c.timeliness_score) / len(completed_calls_list) if completed_calls_list else 0,
        'cleanliness': sum(c.cleanliness_score for c in completed_calls_list if c.cleanliness_score) / len(completed_calls_list) if completed_calls_list else 0,
        'advisor_helpfulness': sum(c.advisor_helpfulness_score for c in completed_calls_list if c.advisor_helpfulness_score) / len(completed_calls_list) if completed_calls_list else 0,
        'work_quality': sum(c.work_quality_score for c in completed_calls_list if c.work_quality_score) / len(completed_calls_list) if completed_calls_list else 0,
        'recommendation': sum(c.recommendation_score for c in completed_calls_list if c.recommendation_score) / len(completed_calls_list) if completed_calls_list else 0
    }
    
    # Count customers ready for call
    ready_for_call = db.query(Customer).outerjoin(
        ServiceRecord
    ).outerjoin(
        CallInteraction
    ).filter(
        Customer.organization_id == current_user.organization_id,
        Customer.is_active == True,
        CallInteraction.id == None
    ).count()
    
    return DashboardStats(
        total_calls=total_calls,
        completed_calls=completed_calls,
        average_rating=average_rating,
        detractors_count=detractors,
        service_feedback_breakdown=feedback_breakdown,
        ready_for_call_count=ready_for_call
    )

@router.get("/ready-for-call", response_model=List[CustomerBase])
async def get_ready_for_call_customers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of customers who haven't been called yet."""
    customers = db.query(Customer).outerjoin(
        ServiceRecord
    ).outerjoin(
        CallInteraction
    ).filter(
        Customer.organization_id == current_user.organization_id,
        Customer.is_active == True,
        CallInteraction.id == None
    ).all()
    
    return customers 