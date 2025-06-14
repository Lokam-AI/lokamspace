from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.route import phone, transcript, feedback
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("garage-bot")
logger.setLevel(logging.INFO)

# Initialize FastAPI app
app = FastAPI(
    title="GarageBot API",
    description="API for managing garage service calls, feedback, and transcripts",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    phone.router,
    prefix="/phone",
    tags=["Phone"]
)

app.include_router(
    transcript.router,
    prefix="/transcript",
    tags=["Transcript"]
)

app.include_router(
    feedback.router,
    prefix="/feedback",
    tags=["Feedback"]
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to GarageBot API",
        "version": "1.0.0",
        "endpoints": {
            "feedback": "/feedback",
            "phone": "/phone",
            "transcript": "/transcript"
        }
    } 

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 