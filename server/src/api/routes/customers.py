from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ...db.base import Customer, ServiceRecord, User
from ...db.session import get_db
from pydantic import BaseModel
from ..dependencies import get_current_user

router = APIRouter()

class CustomerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    vehicle_number: str

class CustomerResponse(BaseModel):
    id: int
    name: str
    email: Optional[str]
    phone: Optional[str]
    vehicle_number: str
    is_active: bool

class ServiceRecordCreate(BaseModel):
    vehicle_number: str
    service_date: str
    service_details: str
    assigned_user_id: Optional[int] = None

@router.post("/", response_model=CustomerResponse)
async def create_customer(
    customer_data: CustomerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new customer."""
    # Check if vehicle number already exists
    existing = db.query(Customer).filter(
        Customer.vehicle_number == customer_data.vehicle_number,
        Customer.organization_id == current_user.organization_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle number already registered"
        )
    
    customer = Customer(
        **customer_data.dict(),
        organization_id=current_user.organization_id
    )
    
    db.add(customer)
    db.commit()
    db.refresh(customer)
    
    return customer

@router.get("/", response_model=List[CustomerResponse])
async def get_customers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get list of customers for the organization."""
    customers = db.query(Customer).filter(
        Customer.organization_id == current_user.organization_id
    ).offset(skip).limit(limit).all()
    
    return customers

@router.post("/{customer_id}/service", response_model=dict)
async def create_service_record(
    customer_id: int,
    service_data: ServiceRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new service record for a customer."""
    # Verify customer belongs to organization
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.organization_id == current_user.organization_id
    ).first()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    service_record = ServiceRecord(
        customer_id=customer_id,
        **service_data.dict()
    )
    
    db.add(service_record)
    db.commit()
    
    return {"message": "Service record created successfully"}

@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customer details."""
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.organization_id == current_user.organization_id
    ).first()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    return customer 