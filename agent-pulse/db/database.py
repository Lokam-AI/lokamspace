from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from config import get_settings

settings = get_settings()

# Force using asyncpg by modifying the URL if needed
db_url = settings.DATABASE_URL
if not db_url.startswith('postgresql+asyncpg://'):
    db_url = db_url.replace('postgresql://', 'postgresql+asyncpg://')

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    pool_pre_ping=True
)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close() 