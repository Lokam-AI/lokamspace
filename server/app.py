# app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import auth, dashboard, customers, survey, service_records, organization
from src.db.init_db import init_db
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=os.getenv("APP_TITLE", "LokamSpace API"),
    description=os.getenv("APP_DESCRIPTION", "API for LokamSpace platform"),
    debug=os.getenv("DEBUG", "False").lower() == "true"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.2.18:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Maximum time to cache preflight requests
)

# Initialize database
@app.on_event("startup")
async def startup_event():
    logger.info("Initializing database...")
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
# app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
# app.include_router(customers.router, prefix="/api/customers", tags=["customers"])
# app.include_router(survey.router, prefix="/api/survey", tags=["survey"])
app.include_router(service_records.router, prefix="/api/service-record", tags=["Service Record"])
app.include_router(organization.router, prefix="/api/organization", tags=["Organization"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to LokamSpace API",
        "version": "1.0.0",
        "environment": os.getenv("ENV", "Production")
    }

# Run with: uvicorn app:app --reload
