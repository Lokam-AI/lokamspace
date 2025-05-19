# app.py
from fastapi import FastAPI


app = FastAPI(title="LokamSpace API")


@app.get("/")
def root():
    return {"message": "Welcome to LokamSpace Backend"}

# Run with: uvicorn server.app:app --reload
