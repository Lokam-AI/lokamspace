"""
API Key management endpoints.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_organization, get_current_user, get_tenant_db
from app.models import Organization, User
from app.schemas import ApiKeyCreate, ApiKeyUpdate, ApiKeyResponse, ApiKeySecret
from app.services.api_key_service import ApiKeyService

router = APIRouter()


@router.post("/", response_model=ApiKeySecret, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    api_key_data: ApiKeyCreate,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
):
    """
    Create a new API key.
    
    Args:
        api_key_data: API key creation data
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        ApiKeySecret: Created API key with secret (shown only once)
    """
    return await ApiKeyService.create_api_key(
        api_key_data=api_key_data,
        organization_id=organization.id,
        created_by_id=current_user.id,
        db=db
    )


@router.get("/", response_model=List[ApiKeyResponse])
async def list_api_keys(
    skip: int = 0,
    limit: int = 100,
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
):
    """
    List API keys for the organization.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        organization: Current organization
        db: Database session
        
    Returns:
        List[ApiKeyResponse]: List of API keys
    """
    return await ApiKeyService.list_api_keys(
        organization_id=organization.id,
        db=db,
        skip=skip,
        limit=limit
    )


@router.get("/{api_key_id}", response_model=ApiKeyResponse)
async def get_api_key(
    api_key_id: UUID,
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
):
    """
    Get a specific API key.
    
    Args:
        api_key_id: API key ID
        organization: Current organization
        db: Database session
        
    Returns:
        ApiKeyResponse: API key details
    """
    api_key = await ApiKeyService.get_api_key(
        api_key_id=api_key_id,
        organization_id=organization.id,
        db=db
    )
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    return api_key


@router.patch("/{api_key_id}", response_model=ApiKeyResponse)
async def update_api_key(
    api_key_id: UUID,
    api_key_data: ApiKeyUpdate,
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
):
    """
    Update an API key.
    
    Args:
        api_key_id: API key ID
        api_key_data: API key update data
        organization: Current organization
        db: Database session
        
    Returns:
        ApiKeyResponse: Updated API key
    """
    api_key = await ApiKeyService.update_api_key(
        api_key_id=api_key_id,
        api_key_data=api_key_data,
        organization_id=organization.id,
        db=db
    )
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    return api_key


@router.delete("/{api_key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api_key(
    api_key_id: UUID,
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
):
    """
    Delete an API key.
    
    Args:
        api_key_id: API key ID
        organization: Current organization
        db: Database session
    """
    success = await ApiKeyService.delete_api_key(
        api_key_id=api_key_id,
        organization_id=organization.id,
        db=db
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )