"""
Setting model for organization settings.
"""

from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from .base import Base


class Setting(Base):
    """
    Setting model for organization-specific settings.
    """
    
# Table name - explicitly set
    
    # Table name - explicitly set
    __tablename__ = "settings"
    

    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Organization (tenant) relationship
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False
    )
    
    # Setting details
    key = Column(String(100), nullable=False)
    value = Column(JSONB, nullable=False)
    category = Column(String(50), nullable=False, default="general")
    description = Column(Text, nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="settings")
    
    def __repr__(self) -> str:
        return f"<Setting {self.id}: {self.key}>" 