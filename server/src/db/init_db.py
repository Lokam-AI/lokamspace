from sqlalchemy.exc import SQLAlchemyError
from .session import engine, Base
from .base import User, Organization  # Import your models
import logging

logger = logging.getLogger(__name__)

def init_db() -> None:
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except SQLAlchemyError as e:
        logger.error(f"Error creating database tables: {e}")
        raise

if __name__ == "__main__":
    init_db() 