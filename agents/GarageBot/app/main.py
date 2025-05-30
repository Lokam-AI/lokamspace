import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from mangum import Mangum
from app.routers import calls
from app.config import get_settings
from typing import Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("garagebot")

settings = get_settings()

app = FastAPI(
    title="GarageBot API",
    description="API for managing GarageBot voice calls and AI interactions",
    version="1.0.0"
)

# Include routers
app.include_router(calls.router, prefix="/api/v1/calls", tags=["calls"])

@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint for AWS."""
    return {"status": "healthy"}

@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint."""
    return {"message": "Welcome to GarageBot API"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled error occurred: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "message": "An unexpected error occurred",
            "detail": str(exc) if settings.DEBUG else "Internal server error"
        }
    )

# AWS Lambda handler
handler = Mangum(app) 