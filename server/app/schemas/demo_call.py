"""
Demo call schemas.
"""

from datetime import datetime
from typing import Dict, Optional, Any
from uuid import UUID

from pydantic import BaseModel


class DemoCallCreate(BaseModel):
    """Schema for creating a demo call."""
    
    customer_name: str
    phone_number: str
    vehicle_number: Optional[str] = None
    service_advisor_name: Optional[str] = None
    service_type: Optional[str] = "Feedback Call"
    campaign_id: Optional[int] = None
    organization_id: Optional[UUID] = None
    appointment_date: Optional[datetime] = None


class DemoCallResponse(BaseModel):
    """Schema for demo call response."""
    
    call_id: int
    customer_name: str
    phone_number: str
    vehicle_number: Optional[str] = None
    campaign_id: Optional[int] = None
    status: str
    vapi_response: Optional[Dict[str, Any]] = None 
    appointment_date: Optional[datetime] = None 