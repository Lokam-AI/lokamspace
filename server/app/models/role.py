"""
Role model for user roles.
"""

from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from .base import Base


class Role(Base):
    """
    Role model for defining user roles and permissions.
    This is used if roles need more flexibility than a simple enum.
    """
    
# Table name - explicitly set
    
    # Table name - explicitly set
    __tablename__ = "roles"
    

    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Role details
    name = Column(String(20), nullable=False, unique=True)
    description = Column(Text)
    
    def __repr__(self) -> str:
        return f"<Role {self.id}: {self.name}>" 