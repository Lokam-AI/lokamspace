"""
Organization API endpoints.
"""

import uuid
from typing import Any, Dict, List

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies import get_admin_user, get_current_organization, get_current_user
from app.models import Organization, User
from app.schemas import OrganizationCreate, OrganizationResponse, OrganizationUpdate, OrganizationSettingsUpdate
from app.services.organization_service import OrganizationService

router = APIRouter()


@router.get("/", response_model=OrganizationResponse)
async def get_current_organization_endpoint(
    organization: Organization = Depends(get_current_organization),
) -> Any:
    """
    Get current organization.
    
    Args:
        organization: Current user's organization
        
    Returns:
        OrganizationResponse: Organization details
    """
    return organization


@router.put("/", response_model=OrganizationResponse)
async def update_organization(
    organization_update: OrganizationUpdate,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Update organization.
    
    Args:
        organization_update: Updated organization data
        organization: Current organization
        current_user: Current authenticated user (admin only)
        db: Database session
        
    Returns:
        OrganizationResponse: Updated organization
    """
    # Update organization fields
    update_data = organization_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(organization, field, value)
    
    # Save changes
    await db.commit()
    await db.refresh(organization)
    
    return organization


@router.put("/settings", response_model=OrganizationResponse)
async def update_organization_settings(
    settings_update: OrganizationSettingsUpdate,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Update organization settings.
    
    Args:
        settings_update: Updated organization settings
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        OrganizationResponse: Updated organization
    """
    return await OrganizationService.update_organization_settings(
        db=db,
        organization_id=organization.id,
        settings_data=settings_update
    )


@router.put("/configuration", response_model=OrganizationResponse)
async def update_organization_configuration(
    config_data: Dict = Body(...),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Update organization configuration.
    
    Args:
        config_data: Configuration data
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        OrganizationResponse: Updated organization
    """
    return await OrganizationService.update_organization_configuration(
        db=db,
        organization_id=organization.id,
        config_data=config_data
    )


@router.get("/stats", response_model=dict)
async def get_organization_stats(
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get organization statistics.
    
    Args:
        organization: Current organization
        db: Database session
        
    Returns:
        dict: Organization statistics
    """
    # Import models
    from app.models import Call, ServiceRecord
    from sqlalchemy import func, and_, or_
    
    # Query total calls
    calls_query = select(func.count()).where(
        Call.organization_id == organization.id
    )
    calls_result = await db.execute(calls_query)
    total_calls = calls_result.scalar_one_or_none() or 0
    
    # Query completed calls
    completed_calls_query = select(func.count()).where(
        Call.organization_id == organization.id,
        Call.status == "Completed"
    )
    completed_calls_result = await db.execute(completed_calls_query)
    completed_calls = completed_calls_result.scalar_one_or_none() or 0
    
    # Query service records
    service_records_query = select(func.count()).where(
        ServiceRecord.organization_id == organization.id
    )
    service_records_result = await db.execute(service_records_query)
    total_service_records = service_records_result.scalar_one_or_none() or 0
    
    # Calculate completion rate
    completion_rate = (completed_calls / total_calls) * 100 if total_calls > 0 else 0
    
    return {
        "total_calls": total_calls,
        "completed_calls": completed_calls,
        "completion_rate": round(completion_rate, 2),
        "total_service_records": total_service_records,
        "credit_balance": float(organization.credit_balance),
    } 