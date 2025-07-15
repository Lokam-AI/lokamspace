"""
Database connection handling for the application.
"""

import logging
from typing import AsyncGenerator, Dict, Optional

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.models.base import Base

logger = logging.getLogger(__name__)

# Database engines for different environments
_engines: Dict[str, AsyncEngine] = {}


def get_engine(db_url: Optional[str] = None) -> AsyncEngine:
    """
    Get or create a database engine instance.
    
    Args:
        db_url: Optional database URL to connect to. If not provided,
                uses the URL from settings.
    
    Returns:
        AsyncEngine: An async SQLAlchemy engine instance
    """
    # Use provided URL or construct from components
    if db_url is not None:
        url = db_url
    else:
        # Construct URL from components if DATABASE_URL is not provided
        url = f"postgresql+asyncpg://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
    
    if not url:
        raise ValueError("Database URL is not configured properly")
    
    # Check if engine already exists for this URL
    if url not in _engines:
        logger.info(f"Creating new database engine for {url}")
        
        # Configure engine based on environment
        if settings.ENVIRONMENT == "testing":
            # Use NullPool for testing to ensure clean state between tests
            poolclass = NullPool
            connect_args = {}
        else:
            # For asyncio engines, we don't specify poolclass as QueuePool is not compatible
            poolclass = None
            connect_args = {
                "timeout": 30,  # connection timeout
                "command_timeout": 30,  # statement execution timeout
            }
        
        # Create engine
        engine_args = {
            "url": url,
            "pool_pre_ping": True,  # verify connections before use
            "pool_size": settings.DB_POOL_SIZE,
            "max_overflow": settings.DB_MAX_OVERFLOW,
            "connect_args": connect_args,
            "echo": settings.DB_ECHO,
        }
        
        # Only add poolclass for testing environment
        if poolclass:
            engine_args["poolclass"] = poolclass
            
        _engines[url] = create_async_engine(**engine_args)
    
    return _engines[url]


# Create session factory
async_session_factory = async_sessionmaker(
    expire_on_commit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency for getting a database session.
    
    Yields:
        AsyncSession: An async SQLAlchemy session
    """
    # Create a new session for each request
    async_session = async_session_factory(bind=get_engine())
    
    try:
        # Return the session
        yield async_session
    finally:
        # Close the session when done
        await async_session.close()


# Database dependency for FastAPI
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session.
    
    This should be used with FastAPI's Depends.
    
    Yields:
        AsyncSession: An async SQLAlchemy session
    """
    async for session in get_session():
        yield session


async def create_db_and_tables() -> None:
    """
    Create database tables if they don't exist.
    
    This function creates all tables defined in SQLAlchemy models.
    It should be called during application startup.
    """
    logger.info("Creating database tables...")
    
    # Get engine
    engine = get_engine()
    
    try:
        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise
