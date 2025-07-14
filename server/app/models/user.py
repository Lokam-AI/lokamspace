"""
User model for system users.
"""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class User(Base):
    """
    User model representing system users with roles and organization membership.
    """
    
# Table name - explicitly set
    
    # Table name - explicitly set
    __tablename__ = "users"
    

    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # User information
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False, unique=True)
    password_hash = Column(Text, nullable=False)
    
    # Role and access control
    role = Column(String(20), nullable=False)  # SuperAdmin, Admin, Manager
    
    # Organization (tenant) relationship
    organization_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("organizations.id"), 
        nullable=False
    )
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    created_campaigns = relationship(
        "Campaign", 
        foreign_keys="Campaign.created_by",
        back_populates="creator"
    )
    modified_campaigns = relationship(
        "Campaign", 
        foreign_keys="Campaign.modified_by",
        back_populates="modifier"
    )
    created_bookings = relationship(
        "Booking", 
        foreign_keys="Booking.created_by",
        back_populates="creator"
    )
    modified_bookings = relationship(
        "Booking", 
        foreign_keys="Booking.modified_by",
        back_populates="modifier"
    )
    created_tags = relationship(
        "Tag", 
        foreign_keys="Tag.created_by",
        back_populates="creator"
    )
    payment_history = relationship("PaymentHistory", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
    uploaded_files = relationship("KnowledgeFile", back_populates="user")
    
    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"
