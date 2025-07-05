"""
Knowledge File service for managing inquiry knowledge source files.
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.knowledge_file import KnowledgeFile
from app.schemas.knowledge_file import KnowledgeFileCreate, KnowledgeFileUpdate


class KnowledgeFileService:
    """Service for managing knowledge files."""
    
    @staticmethod
    async def list_knowledge_files(
        db: AsyncSession,
        organization_id: UUID) -> List[KnowledgeFile]:
        """
        List all knowledge files for an organization.
        
        Args:
            db: Database session
            organization_id: Organization ID
            
        Returns:
            List[KnowledgeFile]: List of knowledge files
        """
        query = select(KnowledgeFile).where(
            KnowledgeFile.organization_id == organization_id
        )
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_knowledge_file(
        db: AsyncSession,
        file_id: int,
        organization_id: UUID) -> KnowledgeFile:
        """
        Get a knowledge file by ID.
        
        Args:
            db: Database session
            file_id: Knowledge file ID
            organization_id: Organization ID
            
        Returns:
            KnowledgeFile: Knowledge file
            
        Raises:
            NotFoundException: If knowledge file not found
        """
        query = select(KnowledgeFile).where(
            KnowledgeFile.id == file_id,
            KnowledgeFile.organization_id == organization_id
        )
        
        result = await db.execute(query)
        knowledge_file = result.scalar_one_or_none()
        
        if knowledge_file is None:
            raise NotFoundException(f"Knowledge file with ID {file_id} not found")
        
        return knowledge_file
    
    @staticmethod
    async def create_knowledge_file(
        db: AsyncSession,
        file_data: KnowledgeFileCreate) -> KnowledgeFile:
        """
        Create a new knowledge file.
        
        Args:
            db: Database session
            file_data: Knowledge file data
            
        Returns:
            KnowledgeFile: Created knowledge file
        """
        knowledge_file = KnowledgeFile(**file_data.model_dump())
        
        db.add(knowledge_file)
        await db.commit()
        await db.refresh(knowledge_file)
        
        return knowledge_file
    
    @staticmethod
    async def update_knowledge_file(
        db: AsyncSession,
        file_id: int,
        organization_id: UUID,
        file_data: KnowledgeFileUpdate) -> KnowledgeFile:
        """
        Update a knowledge file.
        
        Args:
            db: Database session
            file_id: Knowledge file ID
            organization_id: Organization ID
            file_data: Updated knowledge file data
            
        Returns:
            KnowledgeFile: Updated knowledge file
            
        Raises:
            NotFoundException: If knowledge file not found
        """
        knowledge_file = await KnowledgeFileService.get_knowledge_file(
            db=db,
            file_id=file_id,
            organization_id=organization_id
        )
        
        # Update fields
        update_data = file_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(knowledge_file, field, value)
        
        await db.commit()
        await db.refresh(knowledge_file)
        
        return knowledge_file
    
    @staticmethod
    async def delete_knowledge_file(
        db: AsyncSession,
        file_id: int,
        organization_id: UUID) -> None:
        """
        Delete a knowledge file.
        
        Args:
            db: Database session
            file_id: Knowledge file ID
            organization_id: Organization ID
            
        Raises:
            NotFoundException: If knowledge file not found
        """
        knowledge_file = await KnowledgeFileService.get_knowledge_file(
            db=db,
            file_id=file_id,
            organization_id=organization_id
        )
        
        await db.delete(knowledge_file)
        await db.commit() 