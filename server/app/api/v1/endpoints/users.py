"""
User API endpoints.
"""

from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies import get_admin_user, get_current_organization, get_current_user
from app.models import User
from app.schemas import UserCreate, UserResponse, UserUpdate
from app.core.security import get_password_hash

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    List users in the organization.
    
    Args:
        skip: Number of users to skip
        limit: Maximum number of users to return
        organization: Current organization
        db: Database session
        
    Returns:
        List[UserResponse]: List of users
    """
    # Query users
    result = await db.execute(
        select(User)
        .where(User.organization_id == organization.id)
        .offset(skip)
        .limit(limit)
    )
    users = result.scalars().all()
    
    return list(users)


@router.get("/me", response_model=UserResponse)
async def get_current_user_endpoint(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get current user.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        UserResponse: User details
    """
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int = Path(..., ge=1),
    organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get user by ID.
    
    Args:
        user_id: User ID
        organization: Current organization
        db: Database session
        
    Returns:
        UserResponse: User details
    """
    # Query user
    result = await db.execute(
        select(User)
        .where(
            User.id == user_id,
            User.organization_id == organization.id
        )
    )
    user = result.scalar_one_or_none()
    
    # Check if user exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_create: UserCreate,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Create a new user.
    
    Args:
        user_create: User data
        current_user: Current authenticated user (admin only)
        db: Database session
        
    Returns:
        UserResponse: Created user
    """
    # Check if organization matches
    if user_create.organization_id != current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create users for other organizations"
        )
    
    # Check if email is already used
    result = await db.execute(
        select(User).where(User.email == user_create.email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = User(
        name=user_create.name,
        email=user_create.email,
        password_hash=get_password_hash(user_create.password),
        role=user_create.role,
        organization_id=user_create.organization_id,
        is_active=user_create.is_active,
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_update: UserUpdate,
    user_id: int = Path(..., ge=1),
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Update user.
    
    Args:
        user_update: Updated user data
        user_id: User ID
        current_user: Current authenticated user (admin only)
        db: Database session
        
    Returns:
        UserResponse: Updated user
    """
    # Query user
    result = await db.execute(
        select(User)
        .where(
            User.id == user_id,
            User.organization_id == current_user.organization_id
        )
    )
    user = result.scalar_one_or_none()
    
    # Check if user exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user fields
    update_data = user_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    # Save changes
    await db.commit()
    await db.refresh(user)
    
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int = Path(..., ge=1),
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete user.
    
    Args:
        user_id: User ID
        current_user: Current authenticated user (admin only)
        db: Database session
    """
    # Cannot delete own user
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own user"
        )
    
    # Query user
    result = await db.execute(
        select(User)
        .where(
            User.id == user_id,
            User.organization_id == current_user.organization_id
        )
    )
    user = result.scalar_one_or_none()
    
    # Check if user exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Delete user
    await db.delete(user)
    await db.commit()
    
    return None 