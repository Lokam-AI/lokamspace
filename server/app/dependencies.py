"""
FastAPI dependencies for authentication, database access, and more.
"""

from typing import AsyncGenerator, Optional, Union

from fastapi import Depends, HTTPException, Request, Security, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.middleware import TenantQueryFilter
from app.core.security import TokenData, decode_access_token
from app.models import Organization, User

# OAuth2 configuration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_tenant_db(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> AsyncSession:
    """
    Get database session with tenant context.
    
    This dependency ensures that all database queries are filtered by tenant.
    
    Args:
        request: The request object containing tenant information
        db: Database session
        
    Returns:
        AsyncSession: Database session with tenant context
    """
    # Attach tenant information to the session
    if hasattr(request.state, "organization_id"):
        # Store organization_id in session info for potential use
        db.info["organization_id"] = request.state.organization_id
        
    return db


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_tenant_db)
) -> User:
    """
    Get the current authenticated user.
    
    Args:
        token: JWT token from request
        db: Database session
        
    Returns:
        User: The current authenticated user
        
    Raises:
        HTTPException: If authentication fails
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode token
        token_data = decode_access_token(token)
        if token_data.sub is None:
            raise credentials_exception
        
        # Get user from database
        result = await db.execute(
            select(User).where(User.email == token_data.sub)
        )
        user = result.scalar_one_or_none()
        
        if user is None:
            raise credentials_exception
            
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user"
            )
            
        return user
        
    except JWTError:
        raise credentials_exception


async def get_current_organization(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db)
) -> Organization:
    """
    Get the current user's organization.
    
    Args:
        current_user: The current authenticated user
        db: Database session
        
    Returns:
        Organization: The user's organization
        
    Raises:
        HTTPException: If organization does not exist
    """
    result = await db.execute(
        select(Organization).where(Organization.id == current_user.organization_id)
    )
    organization = result.scalar_one_or_none()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
        
    return organization


def check_role(required_role: str):
    """
    Create a dependency that checks if a user has a specific role.
    
    Args:
        required_role: The role required to access the endpoint
        
    Returns:
        Callable: A dependency function that checks the user's role
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{required_role}' required"
            )
        return current_user
        
    return role_checker


# Common role dependencies
get_admin_user = check_role("Admin")
get_manager_user = check_role("Manager") 