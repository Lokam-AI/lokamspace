from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class OrganizationBase(BaseModel):
    """Base model for organization data"""
    name: str = Field(..., description="Organization name")
    email: EmailStr = Field(..., description="Organization email")
    organization_name: str = Field(..., description="Legal organization name")
    location: str = Field(..., description="Organization location")
    kpi_metric_tags: Optional[List[str]] = Field(default=[], description="KPI metric tags")
    escalation_email: Optional[EmailStr] = Field(None, description="Escalation email address")
    google_review_link: Optional[str] = Field(None, description="Google review link")
    outbound_phone_number: Optional[str] = Field(None, description="Outbound phone number")

class OrganizationCreate(OrganizationBase):
    """Model for creating a new organization"""
    pass

class OrganizationUpdate(OrganizationBase):
    """Model for updating an existing organization"""
    pass

class OrganizationResponse(OrganizationBase):
    """Model for organization response"""
    id: int
    total_usage: int = Field(..., description="Total usage in minutes")
    created_at: datetime
    modified_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    } 