"""
Transcript service for handling transcript operations.
"""

from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models import Call, Transcript
from app.schemas import TranscriptCreate, TranscriptUpdate


class TranscriptService:
    """Service for handling transcript operations."""
    
    @staticmethod
    async def list_transcripts(
        db: AsyncSession,
        organization_id: UUID,
        skip: int,
        limit: int,
        call_id: Optional[int],
        status: Optional[str]) -> List[Transcript]:
        """
        List transcripts with optional filtering.
        
        Args:
            organization_id: Organization ID
            db: Database session
            skip: Number of transcripts to skip
            limit: Maximum number of transcripts to return
            call_id: Filter by call ID
            status: Filter by transcript status
            
        Returns:
            List[Transcript]: List of transcripts
        """
        query = select(Transcript).where(Transcript.organization_id == organization_id)
        
        # Apply filters
        if call_id is not None:
            query = query.where(Transcript.call_id == call_id)
        
        if status is not None:
            query = query.where(Transcript.status == status)
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_transcript(
        db: AsyncSession,
        transcript_id: int,
        organization_id: UUID) -> Transcript:
        """
        Get transcript by ID.
        
        Args:
            transcript_id: Transcript ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Transcript: Transcript object
            
        Raises:
            NotFoundException: If transcript not found
        """
        query = select(Transcript).where(
            Transcript.id == transcript_id,
            Transcript.organization_id == organization_id
        )
        
        result = await db.execute(query)
        transcript = result.scalar_one_or_none()
        
        if transcript is None:
            raise NotFoundException(f"Transcript with ID {transcript_id} not found")
        
        return transcript
    
    @staticmethod
    async def create_transcript(
        db: AsyncSession,
        transcript_data: TranscriptCreate) -> Transcript:
        """
        Create a new transcript.
        
        Args:
            transcript_data: Transcript data
            db: Database session
            
        Returns:
            Transcript: Created transcript
        """
        transcript = Transcript(**transcript_data.model_dump())
        
        db.add(transcript)
        await db.commit()
        await db.refresh(transcript)
        
        return transcript
    
    @staticmethod
    async def update_transcript(
        db: AsyncSession,
        transcript_id: int,
        organization_id: UUID,
        transcript_data: TranscriptUpdate) -> Transcript:
        """
        Update transcript.
        
        Args:
            transcript_id: Transcript ID
            organization_id: Organization ID
            transcript_data: Updated transcript data
            db: Database session
            
        Returns:
            Transcript: Updated transcript
            
        Raises:
            NotFoundException: If transcript not found
        """
        transcript = await TranscriptService.get_transcript(
            transcript_id=transcript_id,
            organization_id=organization_id,
            db=db
        )
        
        # Update fields
        update_data = transcript_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(transcript, field, value)
        
        await db.commit()
        await db.refresh(transcript)
        
        return transcript
    
    @staticmethod
    async def delete_transcript(
        db: AsyncSession,
        transcript_id: int,
        organization_id: UUID) -> None:
        """
        Delete transcript.
        
        Args:
            transcript_id: Transcript ID
            organization_id: Organization ID
            db: Database session
            
        Raises:
            NotFoundException: If transcript not found
        """
        transcript = await TranscriptService.get_transcript(
            transcript_id=transcript_id,
            organization_id=organization_id,
            db=db
        )
        
        await db.delete(transcript)
        await db.commit()
    
    @staticmethod
    async def validate_call(
        db: AsyncSession,
        call_id: int,
        organization_id: UUID) -> bool:
        """
        Validate that a call exists and belongs to the organization.
        
        Args:
            call_id: Call ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            bool: True if call exists and belongs to the organization
        """
        query = select(Call).where(
            Call.id == call_id,
            Call.organization_id == organization_id
        )
        
        result = await db.execute(query)
        call = result.scalar_one_or_none()
        
        return call is not None
    
    @staticmethod
    async def get_transcript_with_related_info(
        db: AsyncSession,
        transcript_id: int,
        organization_id: UUID) -> Dict[str, Any]:
        """
        Get transcript with related information.
        
        Args:
            transcript_id: Transcript ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Dict[str, Any]: Transcript with related information
            
        Raises:
            NotFoundException: If transcript not found
        """
        # Get transcript
        transcript = await TranscriptService.get_transcript(
            transcript_id=transcript_id,
            organization_id=organization_id,
            db=db
        )
        
        # Get call information
        query = select(Call).where(
            Call.id == transcript.call_id,
            Call.organization_id == organization_id
        )
        
        result = await db.execute(query)
        call = result.scalar_one_or_none()
        
        # Convert to dict for response
        transcript_dict = transcript.__dict__.copy()
        
        # Add related information
        transcript_dict["audio_available"] = call is not None and call.audio_file_id is not None
        transcript_dict["call_duration"] = call.duration if call else None
        transcript_dict["customer_name"] = call.customer_name if call else None
        
        # Add analysis info
        analysis = await TranscriptService.get_transcript_analysis(
            transcript_id=transcript_id,
            organization_id=organization_id,
            db=db
        )
        transcript_dict["sentiment_score"] = analysis.get("sentiment_score")
        transcript_dict["topics"] = analysis.get("topics")
        
        return transcript_dict
    
    @staticmethod
    async def get_transcript_analysis(
        db: AsyncSession,
        transcript_id: int,
        organization_id: UUID) -> Dict[str, Any]:
        """
        Get transcript analysis.
        
        Args:
            transcript_id: Transcript ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Dict[str, Any]: Transcript analysis results
            
        Raises:
            NotFoundException: If transcript not found
        """
        # Get transcript
        transcript = await TranscriptService.get_transcript(
            transcript_id=transcript_id,
            organization_id=organization_id,
            db=db
        )
        
        # In a real implementation, this would call an NLP service
        # For now, return mock analysis
        return {
            "sentiment_score": 0.75,  # Mock positive sentiment
            "topics": ["service", "appointment", "vehicle"],
            "keywords": ["maintenance", "oil change", "brake", "schedule"],
            "summary": "Customer called to schedule a maintenance appointment for their vehicle.",
            "action_items": ["Schedule service appointment", "Send confirmation email"],
        } 