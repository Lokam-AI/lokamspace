"""
User schemas.
"""

from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema."""
    
    name: str
    email: EmailStr
    role: str = "Manager"


class UserCreate(UserBase):
    """User creation schema."""
    
    password: str = Field(..., min_length=8)
    organization_id: UUID
    is_active: bool = True


class UserUpdate(BaseModel):
    """User update schema."""
    
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserDB(UserBase):
    """User database schema."""
    
    id: int
    organization_id: UUID
    is_active: bool
    
    class Config:
        from_attributes = True


class UserResponse(UserDB):
    """User response schema."""
    
    pass
