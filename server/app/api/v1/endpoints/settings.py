"""
Settings API endpoints.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_organization, get_current_user, get_tenant_db
from app.models import Organization, User
from app.schemas import SettingCreate, SettingResponse, SettingUpdate, OrganizationSettingsResponse
from app.services.settings_service import SettingsService

router = APIRouter()


@router.get("/", response_model=List[SettingResponse])
async def list_settings(
    category: Optional[str] = Query(None, description="Filter by category"),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    List settings.
    
    Args:
        category: Filter by category
        organization: Current organization
        db: Database session
        
    Returns:
        List[SettingResponse]: List of settings
    """
    return await SettingsService.list_settings(
        organization_id=organization.id,
        category=category,
        db=db
    )


@router.get("/by-category", response_model=OrganizationSettingsResponse)
async def get_settings_by_category(
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get settings organized by category.
    
    Args:
        organization: Current organization
        db: Database session
        
    Returns:
        OrganizationSettingsResponse: Settings organized by category
    """
    settings_by_category = await SettingsService.get_settings_by_category(
        organization_id=organization.id,
        db=db
    )
    
    return {
        "organization_id": organization.id,
        "settings": settings_by_category
    }


@router.post("/", response_model=SettingResponse, status_code=status.HTTP_201_CREATED)
async def create_setting(
    setting_data: SettingCreate,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Create a new setting.
    
    Args:
        setting_data: Setting data
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        SettingResponse: Created setting
    """
    # Ensure organization ID matches
    if setting_data.organization_id != organization.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization ID mismatch"
        )
    
    # Check if setting with same key already exists
    existing_setting = await SettingsService.get_setting_by_key(
        key=setting_data.key,
        organization_id=organization.id,
        db=db
    )
    
    if existing_setting:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Setting with key '{setting_data.key}' already exists"
        )
    
    return await SettingsService.create_setting(setting_data=setting_data, db=db)


@router.get("/{setting_id}", response_model=SettingResponse)
async def get_setting(
    setting_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get setting by ID.
    
    Args:
        setting_id: Setting ID
        organization: Current organization
        db: Database session
        
    Returns:
        SettingResponse: Setting details
    """
    return await SettingsService.get_setting(
        setting_id=setting_id,
        organization_id=organization.id,
        db=db
    )


@router.put("/{setting_id}", response_model=SettingResponse)
async def update_setting(
    setting_data: SettingUpdate,
    setting_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Update setting.
    
    Args:
        setting_data: Updated setting data
        setting_id: Setting ID
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        SettingResponse: Updated setting
    """
    return await SettingsService.update_setting(
        setting_id=setting_id,
        organization_id=organization.id,
        setting_data=setting_data,
        db=db
    )


@router.delete("/{setting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_setting(
    setting_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> None:
    """
    Delete setting.
    
    Args:
        setting_id: Setting ID
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
    """
    await SettingsService.delete_setting(
        setting_id=setting_id,
        organization_id=organization.id,
        db=db
    )


@router.put("/by-key/{key}", response_model=SettingResponse)
async def update_setting_by_key(
    key: str,
    value: Any = Body(..., embed=True),
    description: Optional[str] = Body(None, embed=True),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Update setting by key.
    
    Args:
        key: Setting key
        value: New value
        description: New description
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        SettingResponse: Updated setting
    """
    return await SettingsService.update_setting_by_key(
        key=key,
        organization_id=organization.id,
        value=value,
        description=description,
        db=db
    )


@router.post("/initialize", status_code=status.HTTP_200_OK)
async def initialize_settings(
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> dict:
    """
    Initialize default settings for the organization.
    
    Args:
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        dict: Success message
    """
    await SettingsService.initialize_default_settings(
        organization_id=organization.id,
        db=db
    )
    
    return {"message": "Default settings initialized successfully"} 