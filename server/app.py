# app.py
import logging
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.api.routes import auth, dashboard, customers, survey, service_records, organization
from src.db.init_db import init_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize app
app = FastAPI(
    title=os.getenv("APP_TITLE", "LokamSpace API"),
    description=os.getenv("APP_DESCRIPTION", "API for LokamSpace platform"),
    debug=os.getenv("DEBUG", "False").lower() == "true"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://192.168.2.18:3000",
        "https://dev-autopulse.lokam.ai",
        "https://autopulse.lokam.ai"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Log preflight and fix CORS 400 issue on App Runner
@app.options("/{path:path}")
async def preflight_handler(request: Request, path: str):
    origin = request.headers.get("origin")
    request_headers = request.headers.get("access-control-request-headers", "*")
    logger.info(f"OPTIONS request to /{path} from origin: {origin} with headers: {request_headers}")
    return JSONResponse(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": origin or "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": request_headers,
            "Access-Control-Allow-Credentials": "true"
        }
    )

# Log all incoming requests
@app.middleware("http")
async def log_origin(request: Request, call_next):
    logger.info(f"{request.method} request to {request.url.path} from origin: {request.headers.get('origin')}")
    return await call_next(request)

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

# Health check
@app.get("/")
async def root():
    return {
        "message": "Welcome to LokamSpace API",
        "version": "1.0.0",
        "environment": os.getenv("ENV", "Production")
    }

# Run with: uvicorn app:app --host 0.0.0.0 --port 8080
