"""
User service.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models import User
from app.schemas import UserCreate, UserUpdate


class UserService:
    """Service for user operations."""
    
    @staticmethod
    async def get_user(
        db: AsyncSession,
        user_id: int,
        organization_id: UUID) -> User:
        """
        Get user by ID within an organization.
        
        Args:
            user_id: User ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            User: User with given ID
            
        Raises:
            HTTPException: If user not found
        """
        result = await db.execute(
            select(User).where(
                User.id == user_id,
                User.organization_id == organization_id
            )
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        return user
    
    @staticmethod
    async def get_user_by_email(
        db: AsyncSession,
        email: str) -> Optional[User]:
        """
        Get user by email.
        
        Args:
            email: User email
            db: Database session
            
        Returns:
            Optional[User]: User with given email or None if not found
        """
        result = await db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def list_users(
        db: AsyncSession, organization_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[User]:
        """
        List users in an organization.
        
        Args:
            db: Database session
            organization_id: Organization ID
            skip: Number of users to skip
            limit: Maximum number of users to return
            
        Returns:
            List[User]: List of users
        """
        result = await db.execute(
            select(User)
            .where(User.organization_id == organization_id)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
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
        # Check if email is already used
        existing_user = await UserService.get_user_by_email(user_data.email, db)
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        user = User(
            name=user_data.name,
            email=user_data.email,
            password_hash=get_password_hash(user_data.password),
            role=user_data.role,
            organization_id=user_data.organization_id,
            is_active=user_data.is_active,
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        return user
    
    @staticmethod
    async def update_user(
        db: AsyncSession,
        user_id: int,
        organization_id: UUID,
        user_data: UserUpdate) -> User:
        """
        Update user.
        
        Args:
            user_id: User ID
            organization_id: Organization ID
            user_data: Updated user data
            db: Database session
            
        Returns:
            User: Updated user
            
        Raises:
            HTTPException: If user not found or email is already used
        """
        # Get user
        user = await UserService.get_user(user_id, organization_id, db)
        
        # Check if email is being changed and is already used
        if user_data.email and user_data.email != user.email:
            existing_user = await UserService.get_user_by_email(user_data.email, db)
            
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Update user fields
        update_data = user_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        # Save changes
        await db.commit()
        await db.refresh(user)
        
        return user
    
    @staticmethod
    async def delete_user(
        db: AsyncSession,
        user_id: int,
        organization_id: UUID) -> None:
        """
        Delete user.
        
        Args:
            user_id: User ID
            organization_id: Organization ID
            db: Database session
            
        Raises:
            HTTPException: If user not found
        """
        # Get user
        user = await UserService.get_user(user_id, organization_id, db)
        
        # Delete user
        await db.delete(user)
        await db.commit() 