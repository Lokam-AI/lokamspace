"""
KPI model for key performance indicators.
"""

from sqlalchemy import Column, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class KPI(Base):
    """
    KPI model for tracking key performance indicators.
    """
    
# Table name - explicitly set
    
    # Table name - explicitly set
    __tablename__ = "kpis"
    

    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Organization (tenant) relationship
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False
    )
    
    # KPI details
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)  # Core, Custom
    description = Column(Text)
    target_value = Column(Numeric(12, 2))
    
    # Relationships
    organization = relationship("Organization", back_populates="kpis")
    
    def __repr__(self) -> str:
        return f"<KPI {self.id}: {self.name} ({self.type})>"
