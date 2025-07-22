"""
AuditLog model for tracking changes.
"""

from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class AuditLog(Base):
    """
    AuditLog model for tracking entity changes.
    """
    
# Table name - explicitly set
    
    # Table name - explicitly set
    __tablename__ = "auditlogs"
    

    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Organization (tenant) relationship
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False
    )
    
    # User relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Audit details
    entity = Column(String(50), nullable=False)  # The entity type that was changed
    entity_id = Column(String(50), nullable=False)  # The ID of the entity
    action = Column(String(10), nullable=False)  # "create", "update", "delete"
    timestamp = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Before and after values
    old_value = Column(JSONB, nullable=True)
    new_value = Column(JSONB, nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")
    
    def __repr__(self) -> str:
        return f"<AuditLog {self.id}: {self.action} {self.entity} {self.entity_id}>" 