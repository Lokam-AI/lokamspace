"""
Setting model for organization settings.
"""

from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class Setting(Base):
    """
    Setting model for organization-specific settings.
    """
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Organization (tenant) relationship
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organization.id"),
        nullable=False
    )
    
    # Setting details
    key = Column(String(100), nullable=False)
    value = Column(Text, nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="settings")
    
    def __repr__(self) -> str:
        return f"<Setting {self.id}: {self.key}>" 