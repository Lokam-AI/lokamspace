# app.py
from fastapi import FastAPI
from src.api.routes import samba, auth, user
from src.core.config import settings
from src.core.logger import setup_logging

app = FastAPI(title="LokamSpace API")

setup_logging()

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(user.router, prefix="/api/user", tags=["user"])
app.include_router(samba.router, prefix="/api/samba", tags=["samba"])

@app.get("/")
def root():
    return {"message": "Welcome to LokamSpace Backend"}

# Run with: uvicorn server.app:app --reload
