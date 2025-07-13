"""
Tag schemas.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class TagBase(BaseModel):
    """Base tag schema."""
    
    name: str
    type: str = Field(..., description="Tag type: areas_to_focus, service_types, or inquiry_topics")
    
    @field_validator('type')
    @classmethod
    def validate_tag_type(cls, v: str) -> str:
        """Validate tag type."""
        valid_types = ["areas_to_focus", "service_types", "inquiry_topics"]
        if v not in valid_types:
            raise ValueError(f"Tag type must be one of: {', '.join(valid_types)}")
        return v


class TagCreate(TagBase):
    """Tag create schema."""
    
    organization_id: UUID


class TagUpdate(BaseModel):
    """Tag update schema."""
    
    name: Optional[str] = None
    type: Optional[str] = None
    
    @field_validator('type')
    @classmethod
    def validate_tag_type(cls, v: Optional[str]) -> Optional[str]:
        """Validate tag type."""
        if v is None:
            return v
            
        valid_types = ["areas_to_focus", "service_types", "inquiry_topics"]
        if v not in valid_types:
            raise ValueError(f"Tag type must be one of: {', '.join(valid_types)}")
        return v


class TagInDB(TagBase):
    """Tag in DB schema."""
    
    id: int
    organization_id: UUID
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic configuration."""
        
        from_attributes = True


class TagResponse(TagBase):
    """Tag response schema."""
    
    id: int
    organization_id: UUID
    
    class Config:
        """Pydantic configuration."""
        
        from_attributes = True


class TagsCheckResponse(BaseModel):
    """Tag check response schema."""
    
    has_required_tags: bool
    missing_types: List[str] = []
    created_tags: List[dict] = []
    existing_tags: dict = {} 