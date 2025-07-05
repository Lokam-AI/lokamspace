"""
Authentication schemas.
"""

from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    """Token response schema."""
    
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Token payload schema."""
    
    sub: Optional[str] = None
    organization_id: Optional[str] = None
    role: Optional[str] = None


class UserLogin(BaseModel):
    """User login schema."""
    
    email: EmailStr
    password: str = Field(..., min_length=6)


class PasswordReset(BaseModel):
    """Password reset schema."""
    
    email: EmailStr


class PasswordChange(BaseModel):
    """Password change schema."""
    
    current_password: str
    new_password: str = Field(..., min_length=8) 