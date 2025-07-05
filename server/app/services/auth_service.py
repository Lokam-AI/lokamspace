"""
Authentication service.
"""

from datetime import datetime, timedelta
from typing import Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models import User
from app.schemas import UserCreate


class AuthService:
    """Service for authentication operations."""
    
    @staticmethod
    async def authenticate_user(
        db: AsyncSession,
        email: str,
        password: str) -> Optional[User]:
        """
        Authenticate a user by email and password.
        
        Args:
            email: User email
            password: User password
            db: Database session
            
        Returns:
            Optional[User]: Authenticated user or None if authentication fails
        """
        # Find user by email
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        # Check if user exists and password is correct
        if not user or not verify_password(password, user.password_hash):
            return None
            
        # Check if user is active
        if not user.is_active:
            return None
            
        return user
    
    @staticmethod
    async def create_user(
        db: AsyncSession,
        user_data: UserCreate) -> User:
        """
        Create a new user.
        
        Args:
            user_data: User creation data
            db: Database session
            
        Returns:
            User: Created user
            
        Raises:
            HTTPException: If email is already registered
        """
        # Check if email is already registered
        result = await db.execute(select(User).where(User.email == user_data.email))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        user = User(
            email=user_data.email,
            name=user_data.name,
            password_hash=get_password_hash(user_data.password),
            organization_id=user_data.organization_id,
            role=user_data.role,
            is_active=user_data.is_active
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        return user
    
    @staticmethod
    def create_user_token(user: User) -> Tuple[str, datetime]:
        """
        Create an access token for a user.
        
        Args:
            user: User to create token for
            
        Returns:
            Tuple[str, datetime]: Access token and expiration time
        """
        # Set token expiration
        expires_delta = timedelta(seconds=settings.JWT_EXPIRATION)
        expire = datetime.utcnow() + expires_delta
        
        # Create token
        token_data = {
            "sub": user.email,
            "organization_id": str(user.organization_id),
            "role": user.role
        }
        
        access_token = create_access_token(
            data=token_data,
            expires_delta=expires_delta
        )
        
        return access_token, expire
    
    @staticmethod
    async def change_password(
        db: AsyncSession,
        user: User,
        current_password: str,
        new_password: str) -> bool:
        """
        Change user password.
        
        Args:
            user: User to change password for
            current_password: Current password
            new_password: New password
            db: Database session
            
        Returns:
            bool: True if password was changed successfully
            
        Raises:
            HTTPException: If current password is incorrect
        """
        # Verify current password
        if not verify_password(current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect password"
            )
        
        # Update password hash
        user.password_hash = get_password_hash(new_password)
        
        await db.commit()
        
        return True
