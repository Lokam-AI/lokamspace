import os
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
load_dotenv(env_path)

def get_database_url():
    """Get database URL from environment variables with proper error handling"""
    try:
        # Get required environment variables
        db_user = os.getenv("DB_USER")
        db_password = os.getenv("DB_PASSWORD")
        db_host = os.getenv("DB_HOST", "").replace("http://", "").replace("https://", "")
        db_port = os.getenv("DB_PORT", "5432")  # Default to 5432 if not specified
        db_name = os.getenv("DB_NAME")

        # Log the environment variables (excluding password)
        logger.info(f"Database Configuration:")
        logger.info(f"DB_USER: {db_user}")
        logger.info(f"DB_HOST: {db_host}")
        logger.info(f"DB_PORT: {db_port}")
        logger.info(f"DB_NAME: {db_name}")

        # Validate required environment variables
        if not all([db_user, db_password, db_host, db_name]):
            missing_vars = []
            if not db_user: missing_vars.append("DB_USER")
            if not db_password: missing_vars.append("DB_PASSWORD")
            if not db_host: missing_vars.append("DB_HOST")
            if not db_name: missing_vars.append("DB_NAME")
            
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

        # Construct and return the database URL
        return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

    except Exception as e:
        logger.error(f"Error getting database URL: {str(e)}")
        raise 