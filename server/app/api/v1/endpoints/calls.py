"""
Call API endpoints.
"""

from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_organization, get_current_user, get_tenant_db
from app.models import Organization, User, ServiceRecord
from app.schemas import CallCreate, CallResponse, CallUpdate, CSVTemplateResponse, BulkCallUpload
from app.schemas.demo_call import DemoCallCreate, DemoCallResponse
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


@router.get("/ready", response_model=List[CallResponse])
async def list_ready_calls(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get calls with 'Ready' status.
    
    Args:
        skip: Number of calls to skip
        limit: Maximum number of calls to return
        organization: Current organization
        db: Database session
        
    Returns:
        List[CallResponse]: List of calls with 'Ready' status
    """
    try:
        calls = await CallService.list_calls_by_status(
            organization_id=organization.id,
            status="ready",
            skip=skip,
            limit=limit,
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve ready calls: {str(e)}"
        )


@router.get("/missed", response_model=List[CallResponse])
async def list_missed_calls(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get calls with 'Failed' or 'Missed' status.
    
    Args:
        skip: Number of calls to skip
        limit: Maximum number of calls to return
        organization: Current organization
        db: Database session
        
    Returns:
        List[CallResponse]: List of calls with 'Failed' or 'Missed' status
    """
    try:
        calls = await CallService.list_calls_by_status(
            organization_id=organization.id,
            status="missed",
            skip=skip,
            limit=limit,
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve missed calls: {str(e)}"
        )


@router.get("/completed", response_model=List[CallResponse])
async def list_completed_calls(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get calls with 'Completed' status.
    
    Args:
        skip: Number of calls to skip
        limit: Maximum number of calls to return
        organization: Current organization
        db: Database session
        
    Returns:
        List[CallResponse]: List of calls with 'Completed' status
    """
    try:
        calls = await CallService.list_calls_by_status(
            organization_id=organization.id,
            status="completed",
            skip=skip,
            limit=limit,
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve completed calls: {str(e)}"
        )


@router.post("/demo", response_model=DemoCallResponse)
async def create_demo_call(
    demo_data: DemoCallCreate,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Create a demo call.
    
    Args:
        demo_data: Demo call data
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        DemoCallResponse: Created demo call
    """
    # Ensure organization ID matches
    if demo_data.organization_id != organization.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization ID mismatch"
        )
    
    call = await CallService.create_demo_call(
        demo_data=demo_data,
        db=db
    )
    
    return DemoCallResponse(
        call_id=call.id,
        customer_name=demo_data.customer_name,
        phone_number=demo_data.phone_number,
        vehicle_number=demo_data.vehicle_number,
        campaign_id=demo_data.campaign_id,
        status=call.status
    )


@router.post("/demo/{call_id}/initiate", response_model=DemoCallResponse)
async def initiate_demo_call(
    call_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Initiate a demo call.
    
    Args:
        call_id: Call ID
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        DemoCallResponse: Updated demo call
    """
    try:
        call = await CallService.initiate_demo_call(
            call_id=call_id,
            organization_id=organization.id,
            db=db
        )
        
        # Get service record info
        service_record = None
        if call.service_record_id:
            service_record_query = select(ServiceRecord).where(
                ServiceRecord.id == call.service_record_id
            )
            service_record_result = await db.execute(service_record_query)
            service_record = service_record_result.scalars().first()
        
        return DemoCallResponse(
            call_id=call.id,
            customer_name=service_record.customer_name if service_record else None,
            phone_number=call.customer_number,
            vehicle_number=service_record.vehicle_info if service_record else None,
            campaign_id=call.campaign_id,
            status=call.status
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate demo call: {str(e)}"
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


@router.get("/bulk-upload/template", response_model=CSVTemplateResponse)
async def get_csv_template() -> Any:
    """
    Get CSV template for bulk call upload.
    
    Returns:
        CSVTemplateResponse: CSV template with headers and sample row
    """
    return CallService.get_csv_template()


@router.post("/bulk-upload", status_code=status.HTTP_201_CREATED)
async def bulk_upload_calls(
    upload_data: BulkCallUpload,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Bulk upload calls from CSV data.
    
    Args:
        upload_data: Bulk upload data with campaign name and calls
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Dict: Summary of the upload operation
    """
    try:
        result = await CallService.bulk_upload_calls(
            organization_id=organization.id,
            campaign_name=upload_data.campaign_name,
            calls_data=upload_data.calls,
            db=db,
            current_user_id=current_user.id
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process bulk upload: {str(e)}"
        ) 