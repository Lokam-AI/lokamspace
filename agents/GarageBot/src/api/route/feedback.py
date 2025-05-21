from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
import sys
import os
import json
from datetime import datetime

# Add the agents directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../../agents/GarageBot'))
from Agent import Agent

router = APIRouter()

class ServiceFeedback(BaseModel):
    phone_number: str
    overall_rating: Optional[int] = None
    service_time_rating: Optional[int] = None
    cleanliness_rating: Optional[int] = None
    advisor_rating: Optional[int] = None
    work_quality_rating: Optional[int] = None
    recommendation_rating: Optional[int] = None
    feedback_summary: Optional[str] = None
    timestamp: str
    call_duration: Optional[float] = None

@router.get("/{phone_number}", response_model=ServiceFeedback)
async def get_service_feedback(phone_number: str):
    try:
        # Read the feedback file
        feedback_file = "Feedback.json"
        if not os.path.exists(feedback_file):
            raise HTTPException(status_code=404, detail="No feedback found for this call")
            
        with open(feedback_file, 'r') as f:
            feedback_data = json.load(f)
            
        # Get call status for duration
        agent = Agent()
        call_status = agent.call_status
        
        # Extract ratings from feedback data
        ratings = feedback_data.get("ratings", {})
        
        return ServiceFeedback(
            phone_number=phone_number,
            overall_rating=ratings.get("overall_service"),
            service_time_rating=ratings.get("service_time"),
            cleanliness_rating=ratings.get("cleanliness"),
            advisor_rating=ratings.get("advisor"),
            work_quality_rating=ratings.get("work_quality"),
            recommendation_rating=ratings.get("recommendation"),
            feedback_summary=feedback_data.get("summary"),
            timestamp=datetime.now().isoformat(),
            call_duration=call_status.get("duration") if call_status else None
        )
            
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error reading feedback file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[ServiceFeedback])
async def get_all_feedback():
    try:
        # Read the feedback file
        feedback_file = "Feedback.json"
        if not os.path.exists(feedback_file):
            return []
            
        with open(feedback_file, 'r') as f:
            feedback_data = json.load(f)
            
        # Get call status for duration
        agent = Agent()
        call_status = agent.call_status
        
        # Extract ratings from feedback data
        ratings = feedback_data.get("ratings", {})
        
        return [ServiceFeedback(
            phone_number=feedback_data.get("metadata", {}).get("phone_number", "unknown"),
            overall_rating=ratings.get("overall_service"),
            service_time_rating=ratings.get("service_time"),
            cleanliness_rating=ratings.get("cleanliness"),
            advisor_rating=ratings.get("advisor"),
            work_quality_rating=ratings.get("work_quality"),
            recommendation_rating=ratings.get("recommendation"),
            feedback_summary=feedback_data.get("summary"),
            timestamp=datetime.now().isoformat(),
            call_duration=call_status.get("duration") if call_status else None
        )]
            
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error reading feedback file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 