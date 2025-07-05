"""
Call API endpoints.
"""

from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_organization, get_current_user, get_tenant_db
from app.models import Organization, User
from app.schemas import CallCreate, CallResponse, CallUpdate
from app.services.call_service import CallService

router = APIRouter()


@router.get("/", response_model=List[CallResponse])
async def list_calls(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by call status"),
    call_type: Optional[str] = Query(None, description="Filter by call type"),
    service_record_id: Optional[int] = Query(None, description="Filter by service record ID"),
    campaign_id: Optional[int] = Query(None, description="Filter by campaign ID"),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    List calls.
    
    Args:
        skip: Number of calls to skip
        limit: Maximum number of calls to return
        status: Filter by call status
        call_type: Filter by call type
        service_record_id: Filter by service record ID
        campaign_id: Filter by campaign ID
        organization: Current organization
        db: Database session
        
    Returns:
        List[CallResponse]: List of calls
    """
    calls = await CallService.list_calls(
        organization_id=organization.id,
        skip=skip,
        limit=limit,
        status=status,
        call_type=call_type,
        service_record_id=service_record_id,
        campaign_id=campaign_id,
        db=db
    )
    
    # Enhance calls with additional info
    result = []
    for call in calls:
        call_with_info = await CallService.get_call_with_related_info(
            call_id=call.id,
            organization_id=organization.id,
            db=db
        )
        result.append(call_with_info)
    
    return result


@router.post("/", response_model=CallResponse, status_code=status.HTTP_201_CREATED)
async def create_call(
    call_data: CallCreate,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Create a new call.
    
    Args:
        call_data: Call data
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        CallResponse: Created call
    """
    # Ensure organization ID matches
    if call_data.organization_id != organization.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization ID mismatch"
        )
    
    # Validate service record and campaign IDs if provided
    if call_data.service_record_id:
        service_record_exists = await CallService.validate_service_record(
            service_record_id=call_data.service_record_id,
            organization_id=organization.id,
            db=db
        )
        if not service_record_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Service record not found or not accessible"
            )
    
    if call_data.campaign_id:
        campaign_exists = await CallService.validate_campaign(
            campaign_id=call_data.campaign_id,
            organization_id=organization.id,
            db=db
        )
        if not campaign_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Campaign not found or not accessible"
            )
    
    call = await CallService.create_call(call_data=call_data, db=db)
    
    # Return call with related info
    return await CallService.get_call_with_related_info(
        call_id=call.id,
        organization_id=organization.id,
        db=db
    )


@router.get("/{call_id}", response_model=CallResponse)
async def get_call(
    call_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get call by ID.
    
    Args:
        call_id: Call ID
        organization: Current organization
        db: Database session
        
    Returns:
        CallResponse: Call details
    """
    return await CallService.get_call_with_related_info(
        call_id=call_id,
        organization_id=organization.id,
        db=db
    )


@router.put("/{call_id}", response_model=CallResponse)
async def update_call(
    call_data: CallUpdate,
    call_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Update call.
    
    Args:
        call_data: Updated call data
        call_id: Call ID
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        CallResponse: Updated call
    """
    # Validate service record and campaign IDs if provided
    if call_data.service_record_id:
        service_record_exists = await CallService.validate_service_record(
            service_record_id=call_data.service_record_id,
            organization_id=organization.id,
            db=db
        )
        if not service_record_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Service record not found or not accessible"
            )
    
    if call_data.campaign_id:
        campaign_exists = await CallService.validate_campaign(
            campaign_id=call_data.campaign_id,
            organization_id=organization.id,
            db=db
        )
        if not campaign_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Campaign not found or not accessible"
            )
    
    await CallService.update_call(
        call_id=call_id,
        organization_id=organization.id,
        call_data=call_data,
        db=db
    )
    
    # Return updated call with related info
    return await CallService.get_call_with_related_info(
        call_id=call_id,
        organization_id=organization.id,
        db=db
    )


@router.delete("/{call_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_call(
    call_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> None:
    """
    Delete call.
    
    Args:
        call_id: Call ID
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
    """
    await CallService.delete_call(
        call_id=call_id,
        organization_id=organization.id,
        db=db
    )


@router.post("/{call_id}/schedule", response_model=CallResponse)
async def schedule_call(
    call_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Schedule a call for immediate execution.
    
    Args:
        call_id: Call ID
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        CallResponse: Updated call
    """
    await CallService.schedule_call(
        call_id=call_id,
        organization_id=organization.id,
        db=db
    )
    
    # Return updated call with related info
    return await CallService.get_call_with_related_info(
        call_id=call_id,
        organization_id=organization.id,
        db=db
    ) 