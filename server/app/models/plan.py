"""
Plan model for subscription plans.
"""

from sqlalchemy import Column, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from .base import Base


class Plan(Base):
    """
    Plan model for subscription tiers.
    """
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Plan details
    name = Column(String(100), nullable=False, unique=True)
    price = Column(Numeric(12, 2), nullable=False, default=0.00)
    description = Column(Text)
    credit_limit = Column(Numeric(12, 2), nullable=False, default=0.00)
    
    # Relationships
    organizations = relationship("Organization", back_populates="plan")
    payment_history = relationship("PaymentHistory", back_populates="plan")
    
    def __repr__(self) -> str:
        return f"<Plan {self.id}: {self.name} (${self.price})>" 