"""
AudioFile model for call recordings.
"""

from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .base import Base


class AudioFile(Base):
    """
    AudioFile model for storing call recording file information.
    """
    
    # Table name - explicitly set
    __tablename__ = "audio_files"
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Call relationship - one call has one audio file
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=False, unique=True)
    
    # File details
    file_path = Column(Text, nullable=False)
    file_format = Column(String(10))  # e.g., mp3, wav, ogg
    duration_sec = Column(Integer)
    file_size_bytes = Column(Integer)
    
    # Relationships
    call = relationship("Call", back_populates="audio_file")
    
    def __repr__(self) -> str:
        return f"<AudioFile {self.id}: {self.file_format} for call {self.call_id}>"
