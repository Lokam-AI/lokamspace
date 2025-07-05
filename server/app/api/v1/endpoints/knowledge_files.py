"""
Knowledge File API endpoints.
"""

import os
import shutil
import uuid
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Path, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_organization, get_current_user, get_tenant_db
from app.models import Organization, User
from app.schemas.knowledge_file import (
    KnowledgeFileCreate,
    KnowledgeFileResponse,
    KnowledgeFileUpdate,
)
from app.services.knowledge_file_service import KnowledgeFileService

router = APIRouter()

# Configure upload directory for knowledge files
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../../uploads/knowledge_files")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/", response_model=List[KnowledgeFileResponse])
async def list_knowledge_files(
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    List knowledge files.
    
    Args:
        organization: Current organization
        db: Database session
        
    Returns:
        List[KnowledgeFileResponse]: List of knowledge files
    """
    return await KnowledgeFileService.list_knowledge_files(
        organization_id=organization.id,
        db=db
    )


@router.post("/", response_model=KnowledgeFileResponse, status_code=status.HTTP_201_CREATED)
async def create_knowledge_file(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Upload a new knowledge file.
    
    Args:
        file: File to upload
        description: File description
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        KnowledgeFileResponse: Created knowledge file
    """
    # Check file size (10MB limit)
    file_size = 0
    contents = await file.read()
    file_size = len(contents)
    
    if file_size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 10MB limit"
        )
    
    # Check file type
    allowed_types = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
                    "text/plain", "text/csv"]
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not allowed. Only PDF, DOC, DOCX, TXT, and CSV are supported."
        )
    
    # Generate unique filename
    file_id = uuid.uuid4()
    filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Create database record
    file_data = KnowledgeFileCreate(
        name=file.filename,
        file_type=file.content_type,
        file_size=file_size,
        file_path=file_path,
        description=description,
        organization_id=organization.id,
        uploaded_by=current_user.id
    )
    
    return await KnowledgeFileService.create_knowledge_file(
        file_data=file_data,
        db=db
    )


@router.get("/{file_id}", response_model=KnowledgeFileResponse)
async def get_knowledge_file(
    file_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get knowledge file by ID.
    
    Args:
        file_id: Knowledge file ID
        organization: Current organization
        db: Database session
        
    Returns:
        KnowledgeFileResponse: Knowledge file details
    """
    return await KnowledgeFileService.get_knowledge_file(
        file_id=file_id,
        organization_id=organization.id,
        db=db
    )


@router.put("/{file_id}", response_model=KnowledgeFileResponse)
async def update_knowledge_file(
    file_data: KnowledgeFileUpdate,
    file_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Update knowledge file.
    
    Args:
        file_data: Updated knowledge file data
        file_id: Knowledge file ID
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        KnowledgeFileResponse: Updated knowledge file
    """
    return await KnowledgeFileService.update_knowledge_file(
        file_id=file_id,
        organization_id=organization.id,
        file_data=file_data,
        db=db
    )


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_knowledge_file(
    file_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> None:
    """
    Delete knowledge file.
    
    Args:
        file_id: Knowledge file ID
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
    """
    # Get knowledge file to get file path
    knowledge_file = await KnowledgeFileService.get_knowledge_file(
        file_id=file_id,
        organization_id=organization.id,
        db=db
    )
    
    # Delete file from storage
    if os.path.exists(knowledge_file.file_path):
        os.remove(knowledge_file.file_path)
    
    # Delete database record
    await KnowledgeFileService.delete_knowledge_file(
        file_id=file_id,
        organization_id=organization.id,
        db=db
    ) 