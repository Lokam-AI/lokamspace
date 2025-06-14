from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from ...db.session import get_db
from ...db.base import ServiceRecord, User
from ..dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/customers", tags=["Customers"])

class CustomerBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: int
    total_services: int
    last_service_date: Optional[datetime]
    average_nps: Optional[float]

    class Config:
        from_attributes = True

@router.get("/", response_model=List[CustomerResponse])
async def get_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None
):
    """Get list of customers with their service statistics"""
    
    # Base query to get unique customers with their service counts
    query = db.query(
        ServiceRecord.customer_name,
        ServiceRecord.email,
        ServiceRecord.phone,
        func.count(ServiceRecord.id).label('total_services'),
        func.max(ServiceRecord.service_date).label('last_service_date'),
        func.avg(ServiceRecord.nps_score).label('average_nps')
    ).filter(
        ServiceRecord.organization_id == current_user.organization_id
    ).group_by(
        ServiceRecord.customer_name,
        ServiceRecord.email,
        ServiceRecord.phone
    )

    # Apply search filter if provided
    if search:
        search = f"%{search}%"
        query = query.filter(
            (ServiceRecord.customer_name.ilike(search)) |
            (ServiceRecord.email.ilike(search)) |
            (ServiceRecord.phone.ilike(search))
        )

    # Apply pagination
    customers = query.offset(skip).limit(limit).all()

    # Transform results to match response model
    return [
        CustomerResponse(
            id=idx + 1,  # Generate a unique ID for each customer
            name=customer.customer_name,
            email=customer.email,
            phone=customer.phone,
            total_services=customer.total_services,
            last_service_date=customer.last_service_date,
            average_nps=round(customer.average_nps, 2) if customer.average_nps else None
        )
        for idx, customer in enumerate(customers)
    ]

@router.get("/{customer_name}", response_model=CustomerResponse)
async def get_customer_details(
    customer_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a specific customer"""
    
    customer = db.query(
        ServiceRecord.customer_name,
        ServiceRecord.email,
        ServiceRecord.phone,
        func.count(ServiceRecord.id).label('total_services'),
        func.max(ServiceRecord.service_date).label('last_service_date'),
        func.avg(ServiceRecord.nps_score).label('average_nps')
    ).filter(
        ServiceRecord.organization_id == current_user.organization_id,
        ServiceRecord.customer_name == customer_name
    ).group_by(
        ServiceRecord.customer_name,
        ServiceRecord.email,
        ServiceRecord.phone
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return CustomerResponse(
        id=1,  # Since we're using customer_name as identifier
        name=customer.customer_name,
        email=customer.email,
        phone=customer.phone,
        total_services=customer.total_services,
        last_service_date=customer.last_service_date,
        average_nps=round(customer.average_nps, 2) if customer.average_nps else None
    )

@router.get("/{customer_name}/services")
async def get_customer_services(
    customer_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 10
):
    """Get service history for a specific customer"""
    
    services = db.query(ServiceRecord).filter(
        ServiceRecord.organization_id == current_user.organization_id,
        ServiceRecord.customer_name == customer_name
    ).order_by(
        ServiceRecord.service_date.desc()
    ).offset(skip).limit(limit).all()

    if not services:
        raise HTTPException(status_code=404, detail="Customer not found")

    return [
        {
            "id": service.id,
            "service_type": service.service_type,
            "service_date": service.service_date,
            "service_advisor_name": service.service_advisor_name,
            "nps_score": service.nps_score,
            "overall_feedback": service.overall_feedback
        }
        for service in services
    ] 