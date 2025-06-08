from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from src.db.session import get_db
from src.db.base import ServiceRecord, Customer
from src.schemas.service_record import ServiceRecordCreate, ServiceRecordResponse
from ..dependencies import get_current_user
from src.db.base import User

router = APIRouter()

@router.post("/", response_model=ServiceRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_service_record(
    service_record: ServiceRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
    
):
    """
    Create a new service record with customer information.
    If the customer doesn't exist, it will be created.
    """
    # Check if customer exists
    customer = db.query(Customer).filter(
        Customer.vehicle_number == service_record.vehicle_number,
        Customer.organization_id == current_user.organization_id
    ).first()

    if not customer:
        # Create new customer
        customer = Customer(
            organization_id=current_user.organization_id,
            name=service_record.customer_name,
            email=service_record.customer_email,
            phone=service_record.customer_phone,
            vehicle_number=service_record.vehicle_number
        )
        db.add(customer)
        db.flush()  # Get the customer ID without committing

    # Create service record
    new_service_record = ServiceRecord(
        customer_id=customer.id,
        vehicle_number=service_record.vehicle_number,
        service_date=service_record.service_date or datetime.utcnow(),
        service_details=service_record.service_details,
        assigned_user_id=current_user.id
    )

    db.add(new_service_record)
    db.commit()
    db.refresh(new_service_record)

    return ServiceRecordResponse(
        id=new_service_record.id,
        customer_id=customer.id,
        customer_name=customer.name,
        customer_email=customer.email,
        customer_phone=customer.phone,
        vehicle_number=new_service_record.vehicle_number,
        service_date=new_service_record.service_date,
        service_details=new_service_record.service_details,
        assigned_user_id=new_service_record.assigned_user_id,
        created_at=new_service_record.service_date
    )

@router.get("/{service_record_id}", response_model=ServiceRecordResponse)
async def get_service_record(
    service_record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific service record by ID
    """
    service_record = db.query(ServiceRecord).join(Customer).filter(
        ServiceRecord.id == service_record_id,
        Customer.organization_id == current_user.organization_id
    ).first()

    if not service_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service record not found"
        )

    return ServiceRecordResponse(
        id=service_record.id,
        customer_id=service_record.customer_id,
        customer_name=service_record.customer.name,
        customer_email=service_record.customer.email,
        customer_phone=service_record.customer.phone,
        vehicle_number=service_record.vehicle_number,
        service_date=service_record.service_date,
        service_details=service_record.service_details,
        assigned_user_id=service_record.assigned_user_id,
        created_at=service_record.service_date
    )