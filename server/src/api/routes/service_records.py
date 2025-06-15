from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from ...db.session import get_db
from ...db.base import ServiceRecord, User, Organization, OrganizationMetric, CallMetricScore
from ..dependencies import get_current_user
from src.core.constants import ServiceStatus, NPSScoreConstants
from sqlalchemy import func

router = APIRouter()

class ServiceRecordBase(BaseModel):
    customer_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    service_date: datetime
    service_type: str
    service_advisor_name: str
    status: str = "PENDING"
    review_opt_in: bool = True

class ServiceRecordCreate(ServiceRecordBase):
    pass

class ServiceRecordResponse(ServiceRecordBase):
    id: int
    organization_id: int
    attempts: int
    retry_count: int
    last_attempt_at: Optional[datetime]
    duration_sec: Optional[int]
    nps_score: Optional[float]
    overall_feedback: Optional[str]
    transcript: Optional[str]
    recording_url: Optional[str]
    review_sent_at: Optional[datetime]
    created_at: datetime
    created_by: int
    modified_at: Optional[datetime]
    modified_by: Optional[int]

class AreaOfImprovement(BaseModel):
    title: str
    description: str
    sum_metric_score: Optional[int] = None

class ServiceOverviewResponse(BaseModel):
    total_service_records: int
    total_service_records_completed: int
    average_nps_score: Optional[float]
    areas_of_improvement: List[AreaOfImprovement]


    class Config:
        from_attributes = True


def add_area_of_improvement(title: str, desc: str, organization_id: int, db: Session, result_list: list):
    if not (title and desc):
        return
    
    is_metric_available = db.query(OrganizationMetric).filter(
        OrganizationMetric.organization_id == organization_id,
        OrganizationMetric.name == title
    ).first()

    area_info = {
        "title": title,
        "description": desc
    }

    if is_metric_available:
        sum_metric_score = (
            db.query(func.sum(CallMetricScore.score))
              .filter(
                  CallMetricScore.metric_id == is_metric_available.id,
                  CallMetricScore.organization_id == organization_id
              )
              .scalar() or 0
        )
        area_info["sum_metric_score"] = sum_metric_score
        print(f"is_metric_available: {is_metric_available} for {title} for organization {organization_id}")
    
    result_list.append(area_info)



@router.post("/", response_model=ServiceRecordResponse)
async def create_service_record(
    service_data: ServiceRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new service record."""
    service_record = ServiceRecord(
        **service_data.dict(),
        organization_id=current_user.organization_id,
        created_by=current_user.id
    )
    
    db.add(service_record)
    db.commit()
    db.refresh(service_record)
    
    return service_record

@router.get("/", response_model=List[ServiceRecordResponse])
async def get_service_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    customer_name: Optional[str] = None,
    service_type: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """Get list of service records with optional filters."""
    query = db.query(ServiceRecord).filter(
        ServiceRecord.organization_id == current_user.organization_id
    )

    # Apply filters
    if customer_name:
        query = query.filter(ServiceRecord.customer_name.ilike(f"%{customer_name}%"))
    if service_type:
        query = query.filter(ServiceRecord.service_type == service_type)
    if status:
        query = query.filter(ServiceRecord.status == status)
    if start_date:
        query = query.filter(ServiceRecord.service_date >= start_date)
    if end_date:
        query = query.filter(ServiceRecord.service_date <= end_date)

    # Apply pagination
    service_records = query.order_by(
        ServiceRecord.service_date.desc()
    ).offset(skip).limit(limit).all()
    
    return service_records

@router.get("/{service_id}", response_model=ServiceRecordResponse)
async def get_service_record(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details of a specific service record."""
    service_record = db.query(ServiceRecord).filter(
        ServiceRecord.id == service_id,
        ServiceRecord.organization_id == current_user.organization_id
    ).first()
    
    if not service_record:
        raise HTTPException(status_code=404, detail="Service record not found")
    
    return service_record

@router.put("/{service_id}", response_model=ServiceRecordResponse)
async def update_service_record(
    service_id: int,
    service_data: ServiceRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a service record."""
    service_record = db.query(ServiceRecord).filter(
        ServiceRecord.id == service_id,
        ServiceRecord.organization_id == current_user.organization_id
    ).first()
    
    if not service_record:
        raise HTTPException(status_code=404, detail="Service record not found")
    
    # Update fields
    for field, value in service_data.dict().items():
        setattr(service_record, field, value)
    
    service_record.modified_by = current_user.id
    service_record.modified_at = datetime.utcnow()
    
    db.commit()
    db.refresh(service_record)
    
    return service_record

@router.delete("/{service_id}")
async def delete_service_record(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a service record."""
    service_record = db.query(ServiceRecord).filter(
        ServiceRecord.id == service_id,
        ServiceRecord.organization_id == current_user.organization_id
    ).first()
    
    if not service_record:
        raise HTTPException(status_code=404, detail="Service record not found")
    
    db.delete(service_record)
    db.commit()
    
    return {"message": "Service record deleted successfully"}

@router.get("/overview", response_model=ServiceOverviewResponse)
async def get_service_record_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get overview of service records for the organization"""
    print(" \n\n\nService Record Router Included\n\n\n")
    organization_id = current_user.organization_id
    total_service_records = db.query(ServiceRecord).filter(
        ServiceRecord.organization_id == organization_id
    ).count()
    total_service_records_completed = db.query(ServiceRecord).filter(
        ServiceRecord.organization_id == organization_id,
        ServiceRecord.status == ServiceStatus.COMPLETED
    ).count()
    average_nps_score = db.query(func.avg(ServiceRecord.nps_score)).filter(
        ServiceRecord.organization_id == current_user.organization_id,
        ServiceRecord.status == ServiceStatus.COMPLETED
    ).scalar() or 0
    total_detractors = db.query(ServiceRecord).filter(
        ServiceRecord.organization_id == organization_id,
        ServiceRecord.status == ServiceStatus.COMPLETED,
        ServiceRecord.nps_score <= NPSScoreConstants.DETRACTOR_MAX
    ).count()
    areas_of_improvement = db.query(Organization).filter(
        Organization.id == organization_id
    ).all()
    areas_of_improvement_list = []
    for area in areas_of_improvement:
        add_area_of_improvement(area.area_of_imp_1_title, area.area_of_imp_1_desc, organization_id, db, areas_of_improvement_list)
        add_area_of_improvement(area.area_of_imp_2_title, area.area_of_imp_2_desc, organization_id, db, areas_of_improvement_list)
        add_area_of_improvement(area.area_of_imp_3_title, area.area_of_imp_3_desc, organization_id, db, areas_of_improvement_list)

    return {
        "total_service_records": total_service_records,
        "total_service_records_completed": total_service_records_completed,
        "average_nps_score": average_nps_score,
        "total_detractors": total_detractors,
        "areas_of_improvement": areas_of_improvement_list
    }
