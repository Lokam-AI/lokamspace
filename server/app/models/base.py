"""
Base SQLAlchemy model with common functionality.
"""

from datetime import datetime
from typing import Any, Dict

from sqlalchemy import Column, DateTime, MetaData
from sqlalchemy.ext.declarative import declarative_base, declared_attr
from sqlalchemy.sql import func

# Define naming convention for constraints
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

# Create metadata with naming convention
metadata = MetaData(naming_convention=convention)

class Base:
    """Base class for all SQLAlchemy models."""
    
    # Use the metadata with naming convention
    metadata = metadata
    
    # Generate __tablename__ automatically based on class name
    @declared_attr
    def __tablename__(cls) -> str:
        """
        Convert CamelCase class name to snake_case table name.
        Example: ServiceRecord -> service_record
        """
        name = cls.__name__
        return ''.join(['_' + c.lower() if c.isupper() else c.lower() for c in name]).lstrip('_')
    
    # Common columns
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model instance to dictionary."""
        result = {}
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            if isinstance(value, datetime):
                value = value.isoformat()
            result[column.name] = value
        return result


# Create base class for declarative models
Base = declarative_base(cls=Base) 