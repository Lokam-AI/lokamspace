from fastapi.testclient import TestClient
import pytest
from app.main import app

client = TestClient(app)

def test_initiate_call():
    response = client.post(
        "/api/v1/calls/",
        json={"phone_number": "+1234567890"}
    )
    assert response.status_code == 200
    assert "call_id" in response.json()
    assert "status" in response.json()

def test_get_call_status():
    # First create a call
    call_response = client.post(
        "/api/v1/calls/",
        json={"phone_number": "+1234567890"}
    )
    call_id = call_response.json()["call_id"]
    
    # Then get its status
    response = client.get(f"/api/v1/calls/{call_id}")
    assert response.status_code == 200
    assert response.json()["call_id"] == call_id
    assert "status" in response.json()

def test_invalid_phone_number():
    response = client.post(
        "/api/v1/calls/",
        json={"phone_number": "invalid"}
    )
    assert response.status_code == 422  # Validation error 