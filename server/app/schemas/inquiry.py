"""
Inquiry schemas.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class InquiryBase(BaseModel):
    """Base inquiry schema."""
    
    customer_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    message: str
    topic: Optional[str] = None


class InquiryCreate(InquiryBase):
    """Inquiry creation schema."""
    
    organization_id: UUID


class InquiryUpdate(BaseModel):
    """Inquiry update schema."""
    
    customer_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    message: Optional[str] = None
    topic: Optional[str] = None
    status: Optional[str] = None


class InquiryDB(InquiryBase):
    """Inquiry database schema."""
    
    id: int
    organization_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class InquiryResponse(InquiryDB):
    """Inquiry response schema."""
    pass 