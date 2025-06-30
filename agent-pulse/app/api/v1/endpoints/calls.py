from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.core.logging import get_logger
from app.dependencies import verify_security_token
from app.models.schemas import CallInitiateResponse, QuickCallResponse
from app.services.call_service import CallService

logger = get_logger(__name__)
router = APIRouter()

@router.post("/initiate-call", response_model=CallInitiateResponse)
async def initiate_call(
    phone_number: Optional[str] = Query(None, description="Optional phone number to use for the call. If not provided, will use the service record's phone number or fall back to default."),
    db: AsyncSession = Depends(get_db),
    _: str = Depends(verify_security_token)
):
    """
    Initiate the earliest pending call.
    """
    try:
        call_service = CallService(db)
        result = await call_service.initiate_next_pending_call(phone_number)
        
        return CallInitiateResponse(
            message=result["message"],
            call_id=result["call_id"],
            vapi_response=result["vapi_response"]
        )
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error initiating call: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quick-call/{call_id}", response_model=QuickCallResponse)
async def quick_call(
    call_id: int,
    phone_number: Optional[str] = Query(None, description="Optional phone number to use for the call. If not provided, will use the service record's phone number or fall back to default."),
    db: AsyncSession = Depends(get_db),
    _: str = Depends(verify_security_token)
):
    """
    Initiate a call for a specific call_id.
    """
    try:
        call_service = CallService(db)
        result = await call_service.initiate_specific_call(call_id, phone_number)
        
        return QuickCallResponse(
            message=result["message"],
            call_id=result["call_id"],
            service_record_id=result["service_record_id"],
            customer_name=result["customer_name"],
            service_type=result["service_type"],
            vapi_response=result["vapi_response"]
        )
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error initiating call {call_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 