from sqlalchemy.exc import SQLAlchemyError
from .session import engine
from .base import Base, User, Organization  # Import Base from base.py
from .seed import create_seed_data
import logging

logger = logging.getLogger(__name__)

def init_db() -> None:
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Create seed data
        try:
            create_seed_data()
            logger.info("Seed data created successfully")
        except Exception as e:
            logger.warning(f"Seed data creation failed (may already exist): {e}")
            
    except SQLAlchemyError as e:
        logger.error(f"Error creating database tables: {e}")
        raise

if __name__ == "__main__":
    init_db() 