"""
Schemas for knowledge files.
"""

from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class KnowledgeFileBase(BaseModel):
    """Base schema for knowledge file."""
    name: str
    file_type: str
    file_size: int
    description: Optional[str] = None


class KnowledgeFileCreate(KnowledgeFileBase):
    """Schema for creating a knowledge file."""
    organization_id: UUID
    uploaded_by: int
    file_path: str


class KnowledgeFileUpdate(BaseModel):
    """Schema for updating a knowledge file."""
    name: Optional[str] = None
    description: Optional[str] = None


class KnowledgeFileResponse(KnowledgeFileBase):
    """Schema for knowledge file response."""
    id: int
    organization_id: UUID
    file_path: str
    uploaded_by: int
    
    class Config:
        from_attributes = True 