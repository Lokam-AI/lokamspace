"""
Knowledge File schemas.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class KnowledgeFileBase(BaseModel):
    """Base knowledge file schema."""
    
    name: str
    file_type: str
    file_size: int
    description: Optional[str] = None


class KnowledgeFileCreate(KnowledgeFileBase):
    """Knowledge file creation schema."""
    
    organization_id: UUID
    uploaded_by: int
    file_path: str


class KnowledgeFileUpdate(BaseModel):
    """Knowledge file update schema."""
    
    name: Optional[str] = None
    description: Optional[str] = None


class KnowledgeFileDB(KnowledgeFileBase):
    """Knowledge file database schema."""
    
    id: int
    organization_id: UUID
    uploaded_by: int
    file_path: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class KnowledgeFileResponse(KnowledgeFileDB):
    """Knowledge file response schema."""
    pass 