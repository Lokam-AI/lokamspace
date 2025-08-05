"""
API Key model for external API access.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class ApiKey(Base):
    """API Key model for external API authentication."""
    
    __tablename__ = "api_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    secret_hash = Column(String(255), nullable=False, unique=True, index=True)
    secret_key_preview = Column(String(255), nullable=False)  # Masked version for display
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    usage_count = Column(Integer, default=0, nullable=False)
    rate_limit_per_minute = Column(Integer, default=10, nullable=False)
    
    # Webhook configuration
    webhook_url = Column(String(2048), nullable=True)
    webhook_secret = Column(String(255), nullable=True)
    webhook_timeout = Column(Integer, default=30, nullable=False)
    webhook_headers = Column(Text, nullable=True)  # JSON string of headers
    
    # Relationships
    organization = relationship("Organization", back_populates="api_keys")
    created_by = relationship("User")
    
    def __repr__(self):
        return f"<ApiKey(id={self.id}, name={self.name}, organization_id={self.organization_id})>"