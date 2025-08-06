"""
Organization schemas.
"""

from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, HttpUrl


class OrganizationBase(BaseModel):
    """Base organization schema."""
    
    name: str
    email: EmailStr
    google_review_link: Optional[str] = None
    description: Optional[str] = None
    service_center_description: Optional[str] = None
    location: Optional[str] = None
    location_city: Optional[str] = None
    location_value: Optional[str] = None
    call_concurrency_limit: int = 1
    service_types: Optional[List[str]] = None
    focus_areas: Optional[List[str]] = None
    hipaa_compliant: bool = False
    pci_compliant: bool = False


class OrganizationCreate(OrganizationBase):
    """Organization creation schema."""
    pass


class OrganizationUpdate(BaseModel):
    """Organization update schema."""
    
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    google_review_link: Optional[str] = None
    description: Optional[str] = None
    service_center_description: Optional[str] = None
    location: Optional[str] = None
    location_city: Optional[str] = None
    location_value: Optional[str] = None
    call_concurrency_limit: Optional[int] = None
    service_types: Optional[List[str]] = None
    focus_areas: Optional[List[str]] = None
    hipaa_compliant: Optional[bool] = None
    pci_compliant: Optional[bool] = None


class OrganizationSettingsUpdate(BaseModel):
    """Organization settings update schema."""
    
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    location_city: Optional[str] = None
    location_value: Optional[str] = None
    google_review_link: Optional[str] = None


class OrganizationDB(OrganizationBase):
    """Organization database schema."""
    
    id: UUID
    plan_id: Optional[int] = None
    credit_balance: float = 0.0
    
    class Config:
        from_attributes = True


class OrganizationResponse(OrganizationDB):
    """Organization response schema."""
    pass
