# app.py
from fastapi import FastAPI
from src.api.routes import survey


app = FastAPI(title="LokamSpace API")

# Include routers
app.include_router(survey.router, prefix="/survey", tags=["survey"])


@app.get("/")
def root():
    return {
        "message": "Welcome to LokamSpace Backend",
        "endpoints": {
            "start_survey": "/survey/start/{customer_id}",
            "docs": "/docs"
        }
    }

# Run with: uvicorn app:app --reload
