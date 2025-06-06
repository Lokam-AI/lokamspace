from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from .base import Base
import os

# Use the provided DATABASE_URL from the .env file, with asyncpg driver
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:YVIb8t8idDmKVM2hV0nd@database-1.c2tay2maoi9u.us-east-1.rds.amazonaws.com:5432"
)

# Ensure the URL uses the asyncpg driver
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    poolclass=NullPool,
    echo=True  # Set to False in production
)

# Create async session factory
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def init_db():
    """Initialize the database"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    """Dependency to get DB session"""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()