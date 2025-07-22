"""
Service record schemas.
"""

from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ServiceRecordBase(BaseModel):
    """Base service record schema."""
    
    customer_name: str
    customer_phone: str
    vehicle_make: str
    vehicle_model: str
    vehicle_year: int = Field(..., ge=1900, le=2100)
    vehicle_vin: Optional[str] = None
    service_date: date
    service_type: str
    service_description: Optional[str] = None
    status: str = "Scheduled"  # Scheduled, In Progress, Completed, Cancelled
    total_amount: Optional[float] = None
    notes: Optional[str] = None
    is_demo: bool = False


class ServiceRecordCreate(ServiceRecordBase):
    """Service record creation schema."""
    
    organization_id: UUID


class ServiceRecordUpdate(BaseModel):
    """Service record update schema."""
    
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    vehicle_make: Optional[str] = None
    vehicle_model: Optional[str] = None
    vehicle_year: Optional[int] = Field(None, ge=1900, le=2100)
    vehicle_vin: Optional[str] = None
    service_date: Optional[date] = None
    service_type: Optional[str] = None
    service_description: Optional[str] = None
    status: Optional[str] = None
    total_amount: Optional[float] = None
    notes: Optional[str] = None
    is_demo: Optional[bool] = None


class ServiceRecordDB(ServiceRecordBase):
    """Service record database schema."""
    
    id: int
    organization_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ServiceRecordResponse(ServiceRecordDB):
    """Service record response schema."""
    
    call_count: Optional[int] = None
    last_call_date: Optional[datetime] = None
