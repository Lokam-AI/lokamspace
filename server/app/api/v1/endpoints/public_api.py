"""
Public API endpoints for external DMS integration.
"""

from typing import Any, List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_api_key_auth, get_api_key_organization, get_db
from app.models import Organization, ApiKey, Call, ServiceRecord
from app.schemas import FeedbackCallRequest, FeedbackCallResponse
from app.services.call_service import CallService
from app.core.rate_limiter import rate_limit_dependency

router = APIRouter()


@router.post("/calls", response_model=FeedbackCallResponse, status_code=status.HTTP_201_CREATED)
async def create_feedback_call_api(
    feedback_request: FeedbackCallRequest,
    request: Request,
    organization: Organization = Depends(get_api_key_organization),
    api_key: ApiKey = Depends(get_api_key_auth),
    db: AsyncSession = Depends(get_db),
    _: None = Depends(rate_limit_dependency),
) -> Any:
    """
    Create a new feedback call via API key authentication.
    
    Args:
        feedback_request: Feedback call data in structured format
        request: FastAPI request object
        organization: Organization from API key
        api_key: Authenticated API key
        db: Database session
        
    Returns:
        FeedbackCallResponse: Created feedback call response
    """
    try:
        feedback_call = feedback_request.feedback_call
        
        # Create a service record for the feedback call
        service_record = ServiceRecord(
            organization_id=organization.id,
            customer_name=feedback_call.client_details.customer_name,
            customer_phone=feedback_call.client_details.customer_phone,
            service_advisor_name=feedback_call.client_details.service_advisor_name,
            service_type=feedback_call.client_details.service_type or "Feedback Call",
            status="Ready",
            last_service_comment=feedback_call.client_details.last_service_comment,
        )
        
        db.add(service_record)
        await db.flush()  # Flush to get service_record.id
        
        # Create the call record
        call = Call(
            organization_id=organization.id,
            service_record_id=service_record.id,
            customer_number=feedback_call.client_details.customer_phone,
            direction="outbound",
            status="Ready",
            call_reason="Feedback Call",
        )
        
        db.add(call)
        await db.commit()
        await db.refresh(call)
        
        return FeedbackCallResponse(
            id=str(call.id),
            status="created",
            created_at=datetime.utcnow().isoformat(),
            message="Feedback call created successfully",
            call_details={
                "call_id": call.id,
                "service_record_id": service_record.id,
                "organization_id": str(organization.id),
                "api_key_id": str(api_key.id),
                "customer_name": service_record.customer_name,
                "customer_phone": service_record.customer_phone,
                "service_type": service_record.service_type,
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create feedback call: {str(e)}"
        )


@router.get("/calls/{call_id}")
async def get_call_api(
    call_id: int,
    request: Request,
    organization: Organization = Depends(get_api_key_organization),
    api_key: ApiKey = Depends(get_api_key_auth),
    db: AsyncSession = Depends(get_db),
    _: None = Depends(rate_limit_dependency),
) -> Any:
    """
    Get a specific call via API key authentication.
    
    Args:
        call_id: Call ID
        organization: Organization from API key
        api_key: Authenticated API key
        db: Database session
        
    Returns:
        Call details
    """
    try:
        call = await CallService.get_call(
            call_id=call_id,
            organization_id=organization.id,
            db=db
        )
        
        return {
            "id": str(call.id),
            "status": call.status,
            "customer_number": call.customer_number,
            "direction": call.direction,
            "call_reason": call.call_reason,
            "created_at": call.created_at.isoformat() if call.created_at else None,
            "start_time": call.start_time.isoformat() if call.start_time else None,
            "end_time": call.end_time.isoformat() if call.end_time else None,
            "duration_sec": call.duration_sec,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get call: {str(e)}"
        )


@router.get("/calls")
async def list_calls_api(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by call status"),
    call_type: Optional[str] = Query(None, description="Filter by call type"),
    organization: Organization = Depends(get_api_key_organization),
    api_key: ApiKey = Depends(get_api_key_auth),
    db: AsyncSession = Depends(get_db),
    _: None = Depends(rate_limit_dependency),
) -> Any:
    """
    List calls via API key authentication.
    
    Args:
        skip: Number of calls to skip
        limit: Maximum number of calls to return
        status: Filter by call status
        call_type: Filter by call type
        organization: Organization from API key
        api_key: Authenticated API key
        db: Database session
        
    Returns:
        List of calls
    """
    try:
        calls = await CallService.list_calls(
            organization_id=organization.id,
            skip=skip,
            limit=limit,
            status=status,
            call_type=call_type,
            db=db
        )
        
        return [
            {
                "id": str(call.id),
                "status": call.status,
                "customer_number": call.customer_number,
                "direction": call.direction,
                "call_reason": call.call_reason,
                "created_at": call.created_at.isoformat() if call.created_at else None,
                "start_time": call.start_time.isoformat() if call.start_time else None,
                "end_time": call.end_time.isoformat() if call.end_time else None,
                "duration_sec": call.duration_sec,
            }
            for call in calls
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list calls: {str(e)}"
        )


@router.delete("/calls/{call_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_call_api(
    call_id: int,
    request: Request,
    organization: Organization = Depends(get_api_key_organization),
    api_key: ApiKey = Depends(get_api_key_auth),
    db: AsyncSession = Depends(get_db),
    _: None = Depends(rate_limit_dependency),
):
    """
    Cancel a call via API key authentication.
    
    Args:
        call_id: Call ID
        organization: Organization from API key
        api_key: Authenticated API key
        db: Database session
    """
    try:
        await CallService.delete_call(
            call_id=call_id,
            organization_id=organization.id,
            db=db
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel call: {str(e)}"
        )