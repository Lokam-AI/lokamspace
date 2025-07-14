"""
KnowledgeFile model for storing inquiry knowledge source files.
"""

from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class KnowledgeFile(Base):
    """
    KnowledgeFile model for storing inquiry knowledge source files.
    """
    
    # Table name - explicitly set
    __tablename__ = "knowledgefiles"
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Organization (tenant) relationship
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False
    )
    
    # File details
    name = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    file_type = Column(String(50), nullable=False)
    description = Column(Text)
    
    # Metadata
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="knowledge_files")
    user = relationship("User", back_populates="uploaded_files")
    
    def __repr__(self) -> str:
        return f"<KnowledgeFile {self.id}: {self.name}>" 