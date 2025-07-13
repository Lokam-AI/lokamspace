"""
Authentication API endpoints.
"""

from datetime import timedelta
from typing import Any
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.core.security import create_access_token, verify_password, get_password_hash
from app.dependencies import get_current_user
from app.models import User, Organization
from app.schemas import PasswordChange, PasswordReset, Token, UserResponse, UserRegistration, UserLogin
from app.core.config import settings
from app.services.organization_service import OrganizationService
from app.services.tag_service import TagService

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(
    user_data: UserRegistration,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Register a new user and organization.
    
    Args:
        user_data: User registration data
        db: Database session
        
    Returns:
        Token: JWT access token
    """
    # Check if email already exists
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        # Create organization if organization_name is provided
        organization = Organization(
            id=uuid.uuid4(),
            name=user_data.organization_name or f"{user_data.full_name}'s Organization",
            email=user_data.email
        )
        db.add(organization)
        await db.flush()
        
        # Create user
        user = User(
            name=user_data.full_name,
            email=user_data.email,
            password_hash=get_password_hash(user_data.password),
            organization_id=organization.id,
            role="Admin"  # First user is admin
        )
        db.add(user)
        await db.commit()
        await OrganizationService.check_and_initialize_descriptions(db, organization.id)
        await TagService.check_and_create_default_tags(db, organization.id, user.id)
    except IntegrityError as e:
        await db.rollback()
        error_message = str(e)
        
        # Check for specific constraint violations and provide better messages
        if "organizations_name_key" in error_message:
            organization_name = user_data.organization_name or f"{user_data.full_name}'s Organization"
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Organization name '{organization_name}' is already taken. Please choose a different name."
            )
        elif "users_email_key" in error_message:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email address is already in use. Please use a different email."
            )
        else:
            # Generic error for other integrity constraints
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Registration failed due to conflicting data. Please check your inputs and try again."
            )
    
    # Generate access token
    access_token_expires = timedelta(seconds=settings.JWT_EXPIRATION)
    access_token = create_access_token(
        data={
            "sub": user.email,
            "organization_id": str(user.organization_id),
            "role": user.role
        },
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.name,
            "role": user.role,
            "organization_id": str(user.organization_id)
        }
    }


@router.post("/login/json", response_model=Token)
async def login_json(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    JSON login endpoint.
    
    Args:
        login_data: Login credentials in JSON format
        db: Database session
        
    Returns:
        Token: JWT access token
    """
    try:
        # Find user by email
        result = await db.execute(
            select(User).where(User.email == login_data.email)
        )
        user = result.scalar_one_or_none()
        
        # Check if user exists
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No account found with this email address",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if password is correct
        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account is inactive. Please contact support."
            )
        await OrganizationService.check_and_initialize_descriptions(db, user.organization_id)
        await TagService.check_and_create_default_tags(db, user.organization_id, user.id)
        
        # Generate access token
        access_token_expires = timedelta(seconds=settings.JWT_EXPIRATION)
        access_token = create_access_token(
            data={
                "sub": user.email,
                "organization_id": str(user.organization_id),
                "role": user.role
            },
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.name,
                "role": user.role,
                "organization_id": str(user.organization_id)
            }
        }
    except Exception as e:
        # Log the exception (in a real system you'd use a proper logger)
        print(f"Login error: {str(e)}")
        
        # Only re-raise specific HTTP exceptions, convert others to a generic message
        if isinstance(e, HTTPException):
            raise
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login. Please try again later."
        )


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    OAuth2 compatible token login.
    
    Args:
        form_data: OAuth2 form data with username and password
        db: Database session
        
    Returns:
        Token: JWT access token
    """
    try:
        # Find user by email
        result = await db.execute(
            select(User).where(User.email == form_data.username)
        )
        user = result.scalar_one_or_none()
        
        # Check if user exists
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No account found with this email address",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if password is correct
        if not verify_password(form_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account is inactive. Please contact support."
            )
        await OrganizationService.check_and_initialize_descriptions(db, user.organization_id)
        await TagService.check_and_create_default_tags(db, user.organization_id, user.id)
        
        # Generate access token
        access_token_expires = timedelta(seconds=settings.JWT_EXPIRATION)
        access_token = create_access_token(
            data={
                "sub": user.email,
                "organization_id": str(user.organization_id),
                "role": user.role
            },
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.name,
                "role": user.role,
                "organization_id": str(user.organization_id)
            }
        }
    except Exception as e:
        # Log the exception (in a real system you'd use a proper logger)
        print(f"Login error: {str(e)}")
        
        # Only re-raise specific HTTP exceptions, convert others to a generic message
        if isinstance(e, HTTPException):
            raise
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login. Please try again later."
        )


@router.post("/logout")
async def logout() -> Any:
    """
    Logout endpoint.
    
    For JWT-based authentication, the frontend should remove the token.
    This endpoint provides a way to perform any necessary server-side cleanup.
    
    Returns:
        dict: Success message
    """
    # For JWT auth, no server-side session to invalidate
    # This endpoint does not require authentication since the client
    # handles token removal and we want logout to work even with expired tokens
    
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get current user.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: Current user data
    """
    return current_user


@router.post("/password/change", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Change user password.
    
    Args:
        password_data: Password change data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        dict: Success message
    """
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    # Update password hash
    current_user.password_hash = get_password_hash(password_data.new_password)
    
    await db.commit()
    
    return {"message": "Password changed successfully"} 