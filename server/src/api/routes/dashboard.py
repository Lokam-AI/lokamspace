from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
from ...db.base import User, Customer, ServiceRecord, CallInteraction
from ...db.session import get_db
from pydantic import BaseModel
from ..dependencies import get_current_user

router = APIRouter()

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