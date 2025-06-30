from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.core.logging import setup_logging
from app.api.v1.router import router as api_v1_router
from app.models.schemas import HealthResponse

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events."""
    # Startup
    setup_logging()
    yield
    # Shutdown
    pass

def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        debug=settings.DEBUG,
        lifespan=lifespan
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure appropriately for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include API routers
    app.include_router(api_v1_router, prefix="/api/v1")
    
    # Health check endpoint
    @app.get("/health", response_model=HealthResponse)
    async def health_check():
        """Health check endpoint to verify service status."""
        from datetime import datetime
        return HealthResponse(
            status="healthy",
            timestamp=datetime.utcnow().isoformat(),
            service=settings.APP_NAME
        )
    
    return app

# Create the application instance
app = create_app() 