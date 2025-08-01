"""
FastAPI dependencies for authentication, database access, and more.
"""

from typing import AsyncGenerator, Optional, Union

from fastapi import Depends, HTTPException, Request, Security, status, Header
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.middleware import TenantQueryFilter
from app.core.security import TokenData, decode_access_token
from app.models import Organization, User, ApiKey
from app.services.api_key_service import ApiKeyService
from app.core.config import settings

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


async def verify_vapi_secret(
    x_vapi_secret: str = Header(None)
) -> str:
    """
    Verify the VAPI secret token for webhook endpoints.
    
    Args:
        x_vapi_secret: The secret token from VAPI webhook request header
        
    Returns:
        str: The verified secret token
        
    Raises:
        HTTPException: If the secret token is missing or invalid
    """
    if not x_vapi_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing VAPI secret token"
        )
    
    if x_vapi_secret != settings.VAPI_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid VAPI secret token"
        )
    
    return x_vapi_secret


async def get_api_key_auth(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> ApiKey:
    """
    Authenticate requests using API key.
    
    Args:
        request: The request object
        db: Database session
        
    Returns:
        ApiKey: The authenticated API key record
        
    Raises:
        HTTPException: If authentication fails
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid API key",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Get Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise credentials_exception
    
    # Extract API key
    api_key = auth_header.split("Bearer ")[1]
    
    # Verify API key
    api_key_record = await ApiKeyService.verify_api_key(api_key, db)
    
    if not api_key_record:
        raise credentials_exception
    
    # Store organization context in request
    request.state.organization_id = api_key_record.organization_id
    request.state.api_key = api_key_record
    
    # Update usage statistics (async, don't await to avoid blocking)
    await ApiKeyService.update_usage(api_key_record, db)
    
    return api_key_record


async def get_api_key_organization(
    api_key: ApiKey = Depends(get_api_key_auth),
    db: AsyncSession = Depends(get_db)
) -> Organization:
    """
    Get organization from API key authentication.
    
    Args:
        api_key: Authenticated API key
        db: Database session
        
    Returns:
        Organization: The API key's organization
    """
    result = await db.execute(
        select(Organization).where(Organization.id == api_key.organization_id)
    )
    organization = result.scalar_one_or_none()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    return organization 