"""
ScheduleConfig model for call scheduling configuration.
"""

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from .base import Base


class ScheduleConfig(Base):
    """
    ScheduleConfig model for call scheduling configuration.
    """
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Organization (tenant) relationship
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organization.id"),
        nullable=False
    )
    
    # Campaign relationship (optional)
    campaign_id = Column(Integer, ForeignKey("campaign.id"), nullable=True)
    
    # Configuration stored as JSON
    config_json = Column(JSONB, nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="schedule_configs")
    campaign = relationship("Campaign", back_populates="schedule_configs")
    
    def __repr__(self) -> str:
        return f"<ScheduleConfig {self.id}: {self.campaign_id or 'org-wide'}>" 