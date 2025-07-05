"""
Demo call schemas.
"""

from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class DemoCallCreate(BaseModel):
    """Schema for creating a demo call."""
    
    customer_name: str
    phone_number: str
    vehicle_number: Optional[str] = None
    campaign_id: Optional[int] = None
    organization_id: UUID


class DemoCallResponse(BaseModel):
    """Schema for demo call response."""
    
    call_id: int
    customer_name: str
    phone_number: str
    vehicle_number: Optional[str] = None
    campaign_id: Optional[int] = None
    status: str 