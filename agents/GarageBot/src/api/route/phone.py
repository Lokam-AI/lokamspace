from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import sys
import os

# Add the agents directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../../agents/GarageBot'))
from telephony import make_call

router = APIRouter()

class PhoneCallRequest(BaseModel):
    phone_number: str
    name: Optional[str] = None

@router.post("/initiate-call")
async def initiate_phone_call(request: PhoneCallRequest):
    try:
        # Call the make_call function from telephony.py
        result = await make_call(request.phone_number)
        
        # Map the result to appropriate HTTP responses
        if result == "success":
            return {"status": "success", "message": "Call initiated successfully"}
        elif result == "not_answered":
            raise HTTPException(status_code=404, detail="Call was not answered")
        elif result == "busy":
            raise HTTPException(status_code=503, detail="Call was busy")
        elif result == "invalid_number":
            raise HTTPException(status_code=400, detail="Invalid phone number format")
        elif result == "dispatch_failed":
            raise HTTPException(status_code=500, detail="Failed to create call dispatch")
        else:
            raise HTTPException(status_code=500, detail="An error occurred during the call")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 

        #Write a route for call status