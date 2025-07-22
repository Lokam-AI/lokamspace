"""
PaymentHistory model for payment records.
"""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base


class PaymentHistory(Base):
    """
    PaymentHistory model for tracking payments.
    """
    
# Table name - explicitly set
    
    # Table name - explicitly set
    __tablename__ = "paymenthistories"
    

    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Organization (tenant) relationship
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False
    )
    
    # Relationships to plan and user
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Payment details
    amount = Column(Numeric(12, 2), nullable=False)
    payment_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    method = Column(String(50))  # Credit Card, ACH, etc.
    status = Column(String(50), nullable=False)  # Succeeded, Failed, Pending, Refunded
    
    # Relationships
    organization = relationship("Organization", back_populates="payment_history")
    plan = relationship("Plan", back_populates="payment_history")
    user = relationship("User", back_populates="payment_history")
    
    def __repr__(self) -> str:
        return f"<PaymentHistory {self.id}: ${self.amount} - {self.status}>" 