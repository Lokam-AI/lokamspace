# app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import auth, dashboard, customers, survey


app = FastAPI(title="LokamSpace API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(customers.router, prefix="/api/customers", tags=["customers"])
app.include_router(survey.router, prefix="/api/survey", tags=["survey"])


@app.get("/")
async def root():
    return {"message": "Welcome to LokamSpace API"}

# Run with: uvicorn app:app --reload
