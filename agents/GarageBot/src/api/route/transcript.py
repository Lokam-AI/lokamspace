from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict
import sys
import os
import json
from datetime import datetime
from sqlalchemy.orm import Session
from lokamspace.server.src.db.base import CallInteraction
from lokamspace.server.src.db.base import get_db

# Add the agents directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../../agents/GarageBot'))
from Agent import Agent

router = APIRouter()

class TranscriptionResponse(BaseModel):
    phone_number: str
    transcript: Dict
    timestamp: str
    call_duration: Optional[float] = None

@router.get("/{phone_number}", response_model=TranscriptionResponse)
async def get_transcript(phone_number: str):
    try:
        # Read the transcription file
        transcript_file = "Transcription.json"
        if not os.path.exists(transcript_file):
            raise HTTPException(status_code=404, detail="No transcript found for this call")
            
        with open(transcript_file, 'r') as f:
            transcript_data = json.load(f)
            
        # Get call status for duration
        agent = Agent()
        call_status = agent.call_status
        
        return TranscriptionResponse(
            phone_number=phone_number,
            transcript=transcript_data,
            timestamp=datetime.now().isoformat(),
            call_duration=call_status.get("duration") if call_status else None
        )
            
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error reading transcript file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[TranscriptionResponse])
async def get_all_transcripts():
    try:
        # Read the transcription file
        transcript_file = "Transcription.json"
        if not os.path.exists(transcript_file):
            return []
            
        with open(transcript_file, 'r') as f:
            transcript_data = json.load(f)
            
        # Get call status for duration
        agent = Agent()
        call_status = agent.call_status
        
        return [TranscriptionResponse(
            phone_number=transcript_data.get("metadata", {}).get("phone_number", "unknown"),
            transcript=transcript_data,
            timestamp=datetime.now().isoformat(),
            call_duration=call_status.get("duration") if call_status else None
        )]
            
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error reading transcript file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 

@router.get("/{call_id}")
async def get_transcript_from_db(call_id: int, db: Session = Depends(get_db)):
    call = db.query(CallInteraction).filter(CallInteraction.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    return {
        "transcript": call.transcription,
        "summary": call.summary
    } 