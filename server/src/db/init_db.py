from sqlalchemy.exc import SQLAlchemyError
from .session import engine
from .base import Base
from .seed import create_seed_data
import logging
import sys
import os

# Add the server directory to the Python path
server_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, server_dir)

logger = logging.getLogger(__name__)

def init_db() -> None:
    """Initialize the database by creating tables and seeding data"""
    try:
        # Create all tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Create seed data
        try:
            logger.info("Starting seed data creation...")
            create_seed_data()
            logger.info("Seed data created successfully")
        except Exception as e:
            logger.warning(f"Seed data creation failed (may already exist): {e}")
            
    except SQLAlchemyError as e:
        logger.error(f"Error creating database tables: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during database initialization: {e}")
        raise

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Initialize database
    init_db() 