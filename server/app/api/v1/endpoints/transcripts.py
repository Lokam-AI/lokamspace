"""
Transcript API endpoints.
"""

from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_organization, get_current_user, get_tenant_db
from app.models import Organization, User
from app.schemas import TranscriptCreate, TranscriptResponse, TranscriptUpdate
from app.services.transcript_service import TranscriptService

router = APIRouter()


@router.get("/", response_model=List[TranscriptResponse])
async def list_transcripts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    call_id: Optional[int] = Query(None, description="Filter by call ID"),
    status: Optional[str] = Query(None, description="Filter by transcript status"),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    List transcripts.
    
    Args:
        skip: Number of transcripts to skip
        limit: Maximum number of transcripts to return
        call_id: Filter by call ID
        status: Filter by transcript status
        organization: Current organization
        db: Database session
        
    Returns:
        List[TranscriptResponse]: List of transcripts
    """
    transcripts = await TranscriptService.list_transcripts(
        organization_id=organization.id,
        skip=skip,
        limit=limit,
        call_id=call_id,
        status=status,
        db=db
    )
    
    # Enhance transcripts with additional info
    result = []
    for transcript in transcripts:
        enhanced_transcript = await TranscriptService.get_transcript_with_related_info(
            transcript_id=transcript.id,
            organization_id=organization.id,
            db=db
        )
        result.append(enhanced_transcript)
    
    return result


@router.post("/", response_model=TranscriptResponse, status_code=status.HTTP_201_CREATED)
async def create_transcript(
    transcript_data: TranscriptCreate,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Create a new transcript.
    
    Args:
        transcript_data: Transcript data
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        TranscriptResponse: Created transcript
    """
    # Ensure organization ID matches
    if transcript_data.organization_id != organization.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization ID mismatch"
        )
    
    # Validate call ID
    call_exists = await TranscriptService.validate_call(
        call_id=transcript_data.call_id,
        organization_id=organization.id,
        db=db
    )
    if not call_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Call not found or not accessible"
        )
    
    transcript = await TranscriptService.create_transcript(
        transcript_data=transcript_data,
        db=db
    )
    
    # Return transcript with related info
    return await TranscriptService.get_transcript_with_related_info(
        transcript_id=transcript.id,
        organization_id=organization.id,
        db=db
    )


@router.get("/{transcript_id}", response_model=TranscriptResponse)
async def get_transcript(
    transcript_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get transcript by ID.
    
    Args:
        transcript_id: Transcript ID
        organization: Current organization
        db: Database session
        
    Returns:
        TranscriptResponse: Transcript details
    """
    return await TranscriptService.get_transcript_with_related_info(
        transcript_id=transcript_id,
        organization_id=organization.id,
        db=db
    )


@router.put("/{transcript_id}", response_model=TranscriptResponse)
async def update_transcript(
    transcript_data: TranscriptUpdate,
    transcript_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Update transcript.
    
    Args:
        transcript_data: Updated transcript data
        transcript_id: Transcript ID
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        TranscriptResponse: Updated transcript
    """
    transcript = await TranscriptService.update_transcript(
        transcript_id=transcript_id,
        organization_id=organization.id,
        transcript_data=transcript_data,
        db=db
    )
    
    # Return updated transcript with related info
    return await TranscriptService.get_transcript_with_related_info(
        transcript_id=transcript_id,
        organization_id=organization.id,
        db=db
    )


@router.delete("/{transcript_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transcript(
    transcript_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> None:
    """
    Delete transcript.
    
    Args:
        transcript_id: Transcript ID
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
    """
    await TranscriptService.delete_transcript(
        transcript_id=transcript_id,
        organization_id=organization.id,
        db=db
    )


@router.get("/{transcript_id}/analysis", response_model=dict)
async def get_transcript_analysis(
    transcript_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get transcript analysis.
    
    Args:
        transcript_id: Transcript ID
        organization: Current organization
        db: Database session
        
    Returns:
        dict: Transcript analysis results
    """
    return await TranscriptService.get_transcript_analysis(
        transcript_id=transcript_id,
        organization_id=organization.id,
        db=db
    ) 