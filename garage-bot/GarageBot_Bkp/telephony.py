import asyncio
import os
import json
import random
import logging
from dotenv import load_dotenv
from livekit import api
from datetime import datetime
from sqlalchemy.orm import Session

from src.db import CallInteraction, Feedback

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("telephony")
logger.setLevel(logging.INFO)

# Load environment variables
load_dotenv()

class TelephonyManager:
    def __init__(self, db: Session = None):
        self.lkapi = api.LiveKitAPI(
            url=os.getenv("LIVEKIT_URL"),
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET")
        )
        self.outbound_trunk_id = os.getenv("SIP_OUTBOUND_TRUNK_ID")
        self.active_rooms = {}  # Track active rooms
        self.db = db
        
        # Load trunk configuration
        try:
            with open('outbound-trunk-example.json', 'r') as f:
                self.trunk_config = json.load(f)
            logger.info("Successfully loaded trunk configuration")
        except Exception as e:
            logger.error(f"Error loading trunk configuration: {str(e)}")
            self.trunk_config = None

    async def create_dispatch(self, phone_number: str, call_record: CallInteraction = None):
        """Create a dispatch request to initiate the call"""
        try:
            # Create a unique room name
            room_name = f"outbound-{''.join(str(random.randint(0, 9)) for _ in range(10))}"
            logger.info(f"Creating room: {room_name}")
            
            # Create the dispatch request
            dispatch_request = api.CreateAgentDispatchRequest(
                agent_name="CarServiceReviewAgent",
                room=room_name,
                metadata=json.dumps({
                    "phone_number": phone_number,
                    "call_id": call_record.id if call_record else None
                })
            )
            
            # Send the dispatch request
            response = await self.lkapi.agent_dispatch.create_dispatch(dispatch_request)
            logger.info(f"Successfully created dispatch. Room: {room_name}")
            
            # Track the room
            self.active_rooms[room_name] = {
                "phone_number": phone_number,
                "start_time": datetime.now().isoformat(),
                "call_record": call_record
            }
            
            return room_name
            
        except Exception as e:
            logger.error(f"Error creating dispatch: {str(e)}")
            if hasattr(e, 'metadata'):
                logger.error(f"Error metadata: {e.metadata}")
            return None

    async def create_sip_participant(self, room_name: str, phone_number: str):
        """Create a SIP participant for the call"""
        try:
            # Ensure phone number has country code
            if not phone_number.startswith('+'):
                phone_number = '+91' + phone_number  # Default to India if no country code
            
            # Create SIP participant
            response = await self.lkapi.sip.create_sip_participant(
                api.CreateSIPParticipantRequest(
                    room_name=room_name,
                    sip_trunk_id=self.outbound_trunk_id,
                    sip_call_to=phone_number,
                    participant_identity=phone_number,
                    wait_until_answered=True,
                )
            )
            logger.info(f"Successfully created SIP participant for {phone_number}")
            return True
        except Exception as e:
            error_message = str(e)
            logger.error(f"{error_message}")
            return "error"


    async def end_call(self, room_name: str, disconnect_reason: str = None):
        """End a call for a specific room and update database"""
        try:
            logger.info(f"Ending call for room: {room_name}")
            
            # Update database if we have a call record
            if room_name in self.active_rooms and self.active_rooms[room_name].get("call_record"):
                call_record = self.active_rooms[room_name]["call_record"]
                if self.db:
                    call_record.transcription = "Call transcript will be updated here"  # This should be updated with actual transcript
                    call_record.summary = "Call summary will be updated here"  # This should be updated with actual summary
                    self.db.commit()
            
            # Remove room from active rooms
            if room_name in self.active_rooms:
                del self.active_rooms[room_name]
            
            # Close the room
            await self.lkapi.room.delete_room(room_name)
            logger.info(f"Successfully ended call for room: {room_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error ending call: {str(e)}")
            if hasattr(e, 'metadata'):
                logger.error(f"Error metadata: {e.metadata}")
            return False

    async def close(self):
        """Close the API connection and end all active calls"""
        try:
            # End all active calls
            for room_name in list(self.active_rooms.keys()):
                await self.end_call(room_name)
            
            # Close the API connection
            await self.lkapi.aclose()
            logger.info("API connection closed and all calls ended")
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")

async def make_call(phone_number: str, db: Session = None):
    """Main function to initiate a call"""
    # Validate phone number format
    if not phone_number.startswith('+'):
        # Default to US number if no country code
        phone_number = '+1' + phone_number
        
    # Remove any spaces, dashes, or parentheses from the number
    phone_number = ''.join(filter(str.isdigit, phone_number))
    if not phone_number.startswith('+'):
        phone_number = '+' + phone_number
        
    if not phone_number[1:].isdigit():
        logger.error("Phone number must contain only digits after the '+'")
        return "invalid_number"
        
    if len(phone_number) < 11:  # Minimum length for US numbers with country code
        logger.error("Phone number must be at least 11 digits long (including country code)")
        return "invalid_number"

    telephony = TelephonyManager(db)
    try:
        # Create a new call record if we have a database session
        call_record = None
        if db:
            call_record = CallInteraction(
                call_started=datetime.utcnow(),
                transcription="",
                summary=""
            )
            db.add(call_record)
            db.commit()

        # Create dispatch
        room_name = await telephony.create_dispatch(phone_number, call_record)
        if not room_name:
            logger.error("Failed to create dispatch")
            return "dispatch_failed"

        # Create SIP participant
        result = await telephony.create_sip_participant(room_name, phone_number)
        if result != True:
            return result  # Return the specific error status

        logger.info(f"Call initiated to {phone_number}")
        return {"status": "success", "call_id": call_record.id if call_record else None}

    except Exception as e:
        logger.error(f"Error making call: {str(e)}")
        return {"status": "error", "error": str(e)}
    finally:
        await telephony.close()

if __name__ == "__main__":
    # Get phone number from command line argument or use default
    import sys
    phone_number = sys.argv[1] if len(sys.argv) > 1 else "8281013561"  # Default number without country code
    
    # Run the call
    result = asyncio.run(make_call(phone_number))
    
    # Print the result in a user-friendly way
    result_messages = {
        "success": "Call was successful",
        "not_answered": "Call was not answered",
        "busy": "Call was busy",
        "invalid_number": "Invalid phone number format",
        "dispatch_failed": "Failed to create call dispatch",
        "error": "An error occurred during the call"
    }
    
    # print(f"\nCall Result: {result_messages.get(result.get('status', 'unknown'), 'Unknown status')}") 

    print(result)