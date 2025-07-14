"""
Authentication schemas.
"""

from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserInfo(BaseModel):
    """User info for token response."""
    id: str
    email: EmailStr
    full_name: str
    role: str
    organization_id: str


class Token(BaseModel):
    """Token response schema."""
    
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserInfo] = None


class TokenPayload(BaseModel):
    """Token payload schema."""
    
    sub: Optional[str] = None
    organization_id: Optional[str] = None
    role: Optional[str] = None


class UserLogin(BaseModel):
    """User login schema."""
    
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserRegistration(BaseModel):
    """User registration schema."""
    
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    organization_name: Optional[str] = None


class PasswordReset(BaseModel):
    """Password reset schema."""
    
    email: EmailStr


class PasswordChange(BaseModel):
    """Password change schema."""
    
    current_password: str
    new_password: str = Field(..., min_length=8)


class TokenData(BaseModel):
    """Token data schema."""
    
    email: str | None = None
    organization_id: str | None = None


class LoginForm(BaseModel):
    """Login form schema."""
    
    username: str
    password: str


class LoginJSON(BaseModel):
    """Login JSON schema."""
    
    email: EmailStr
    password: str


class RegisterForm(BaseModel):
    """Register form schema."""
    
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    organization_name: str | None = None


class PasswordResetRequest(BaseModel):
    """Password reset request schema."""
    
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation schema."""
    
    token: str
    new_password: str = Field(..., min_length=8) 