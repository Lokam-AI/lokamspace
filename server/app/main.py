"""
Main FastAPI application entry point.
"""

import logging
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import create_db_and_tables
from app.core.exceptions import setup_exception_handlers
from app.core.middleware import TenantMiddleware
from app.core.logging_middleware import RequestLoggingMiddleware
from app.core.rate_limiter import cleanup_old_requests


# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan event handler.
    
    This runs before the application starts and after it stops.
    """
    # Create tables if they don't exist
    if settings.CREATE_TABLES_ON_STARTUP:
        logger.info("Creating database tables...")
        await create_db_and_tables()
    
    # Start background task for rate limiter cleanup
    async def periodic_cleanup():
        while True:
            cleanup_old_requests()
            await asyncio.sleep(300)  # Cleanup every 5 minutes
    
    cleanup_task = asyncio.create_task(periodic_cleanup())
    
    logger.info("Application startup complete")
    yield
    
    # Cancel cleanup task on shutdown
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass
        
    logger.info("Application shutdown complete")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
    lifespan=lifespan,
    # Disable automatic redirect with trailing slashes
    # This prevents the 307 redirects
    redirect_slashes=False
)

# Set up exception handlers
setup_exception_handlers(app)

# Set up CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging middleware (logs body, query params, URL params, endpoint, org ID)
app.add_middleware(RequestLoggingMiddleware)

# Add tenant middleware
app.add_middleware(TenantMiddleware)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    # Run the application directly if script is executed
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=settings.LOG_LEVEL.lower(),
    )
