from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from ...db.session import get_db
from ...db.base import ServiceRecord, User
from ..dependencies import get_current_user

router = APIRouter(prefix="/service-records", tags=["Service Records"])

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

    class Config:
        from_attributes = True

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