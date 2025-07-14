"""
Service record API endpoints.
"""

from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_organization, get_current_user, get_tenant_db
from app.models import Organization, User
from app.schemas import ServiceRecordCreate, ServiceRecordResponse, ServiceRecordUpdate
from app.services.service_record_service import ServiceRecordService

router = APIRouter()


@router.get("/", response_model=List[ServiceRecordResponse])
async def list_service_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by service record status"),
    customer_name: Optional[str] = Query(None, description="Filter by customer name"),
    vehicle_make: Optional[str] = Query(None, description="Filter by vehicle make"),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    List service records.
    
    Args:
        skip: Number of service records to skip
        limit: Maximum number of service records to return
        status: Filter by service record status
        customer_name: Filter by customer name
        vehicle_make: Filter by vehicle make
        organization: Current organization
        db: Database session
        
    Returns:
        List[ServiceRecordResponse]: List of service records
    """
    service_records = await ServiceRecordService.list_service_records(
        organization_id=organization.id,
        skip=skip,
        limit=limit,
        status=status,
        customer_name=customer_name,
        vehicle_make=vehicle_make,
        db=db
    )
    
    # Enhance service records with call information
    result = []
    for record in service_records:
        call_info = await ServiceRecordService.get_service_record_call_info(
            service_record_id=record.id,
            organization_id=organization.id,
            db=db
        )
        
        record_dict = ServiceRecordResponse.model_validate(record).model_dump()
        record_dict["call_count"] = call_info.get("call_count", 0)
        record_dict["last_call_date"] = call_info.get("last_call_date")
        
        result.append(ServiceRecordResponse(**record_dict))
    
    return result


@router.post("/", response_model=ServiceRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_service_record(
    service_record_data: ServiceRecordCreate,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Create a new service record.
    
    Args:
        service_record_data: Service record data
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        ServiceRecordResponse: Created service record
    """
    # Ensure organization ID matches
    if service_record_data.organization_id != organization.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization ID mismatch"
        )
    
    service_record = await ServiceRecordService.create_service_record(
        service_record_data=service_record_data,
        db=db
    )
    
    return service_record


@router.get("/{service_record_id}", response_model=ServiceRecordResponse)
async def get_service_record(
    service_record_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get service record by ID.
    
    Args:
        service_record_id: Service record ID
        organization: Current organization
        db: Database session
        
    Returns:
        ServiceRecordResponse: Service record details
    """
    service_record = await ServiceRecordService.get_service_record(
        service_record_id=service_record_id,
        organization_id=organization.id,
        db=db
    )
    
    # Get call information
    call_info = await ServiceRecordService.get_service_record_call_info(
        service_record_id=service_record_id,
        organization_id=organization.id,
        db=db
    )
    
    # Combine service record data with call info
    record_dict = ServiceRecordResponse.model_validate(service_record).model_dump()
    record_dict["call_count"] = call_info.get("call_count", 0)
    record_dict["last_call_date"] = call_info.get("last_call_date")
    
    return ServiceRecordResponse(**record_dict)


@router.put("/{service_record_id}", response_model=ServiceRecordResponse)
async def update_service_record(
    service_record_data: ServiceRecordUpdate,
    service_record_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Update service record.
    
    Args:
        service_record_data: Updated service record data
        service_record_id: Service record ID
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        ServiceRecordResponse: Updated service record
    """
    service_record = await ServiceRecordService.update_service_record(
        service_record_id=service_record_id,
        organization_id=organization.id,
        service_record_data=service_record_data,
        db=db
    )
    
    # Get call information
    call_info = await ServiceRecordService.get_service_record_call_info(
        service_record_id=service_record_id,
        organization_id=organization.id,
        db=db
    )
    
    # Combine service record data with call info
    record_dict = ServiceRecordResponse.model_validate(service_record).model_dump()
    record_dict["call_count"] = call_info.get("call_count", 0)
    record_dict["last_call_date"] = call_info.get("last_call_date")
    
    return ServiceRecordResponse(**record_dict)


@router.delete("/{service_record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service_record(
    service_record_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> None:
    """
    Delete service record.
    
    Args:
        service_record_id: Service record ID
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
    """
    await ServiceRecordService.delete_service_record(
        service_record_id=service_record_id,
        organization_id=organization.id,
        db=db
    ) 