from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from datetime import datetime
import re

class ServiceRecordBase(BaseModel):
    """Base model for service record data"""
    name: str = Field(..., description="Customer name", min_length=2, max_length=100)
    email: Optional[EmailStr] = Field(None, description="Customer email")
    vehicle_number: str = Field(..., description="Vehicle registration number", min_length=5, max_length=20)
    service_type: str = Field(..., description="Type of service required", min_length=3, max_length=100)
    service_date: datetime = Field(..., description="Date of service")
    status: str = Field(default="READY_TO_DIAL", description="Service status")

    @validator('vehicle_number')
    def validate_vehicle_number(cls, v):
        """Validate vehicle number format"""
        if not v:
            raise ValueError("Vehicle number is required")
        # Remove spaces and convert to uppercase
        v = v.replace(" ", "").upper()
        if len(v) < 5:
            raise ValueError("Vehicle number must be at least 5 characters")
        return v

    @validator('service_type')
    def validate_service_type(cls, v):
        """Validate service type"""
        if not v:
            raise ValueError("Service type is required")
        if len(v) < 3:
            raise ValueError("Service type must be at least 3 characters")
        return v

    @validator('name')
    def validate_name(cls, v):
        """Validate customer name"""
        if not v:
            raise ValueError("Customer name is required")
        if len(v) < 2:
            raise ValueError("Customer name must be at least 2 characters")
        return v.strip()

class ServiceRecordCreate(ServiceRecordBase):
    """Model for creating a new service record"""
    pass

class ServiceRecordUpdate(BaseModel):
    """Model for updating a service record"""
    name: Optional[str] = Field(None, description="Customer name", min_length=2, max_length=100)
    email: Optional[EmailStr] = Field(None, description="Customer email")
    vehicle_number: Optional[str] = Field(None, description="Vehicle registration number", min_length=5, max_length=20)
    service_type: Optional[str] = Field(None, description="Type of service required", min_length=3, max_length=100)
    service_date: Optional[datetime] = Field(None, description="Date of service")
    status: Optional[str] = Field(None, description="Service status")

    @validator('vehicle_number')
    def validate_vehicle_number(cls, v):
        if v is not None:
            v = v.replace(" ", "").upper()
            if len(v) < 5:
                raise ValueError("Vehicle number must be at least 5 characters")
        return v

class ServiceRecordResponse(ServiceRecordBase):
    """Model for service record response"""
    id: int
    organization_id: int
    created_by: int
    created_at: datetime
    modified_by: Optional[int] = None
    modified_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ServiceRecordList(BaseModel):
    """Model for list of service records"""
    total: int
    items: List[ServiceRecordResponse]

class ServiceRecordFilter(BaseModel):
    """Model for filtering service records"""
    name: Optional[str] = None
    email: Optional[str] = None
    vehicle_number: Optional[str] = None
    service_type: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    page: int = Field(1, ge=1)
    limit: int = Field(10, ge=1, le=100)

class ServiceRecordStats(BaseModel):
    """Model for service record statistics"""
    total_records: int
    pending_records: int
    completed_records: int
    cancelled_records: int
    average_completion_time: Optional[float] = None
    most_common_service_type: Optional[str] = None
    most_common_vehicle_type: Optional[str] = None