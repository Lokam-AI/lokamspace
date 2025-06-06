import asyncio
import logging
from datetime import datetime
from livekit import api
from typing import Optional, Dict
import os
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("telephony_service")

load_dotenv()

class TelephonyService:
    def __init__(self):
        self.lkapi = api.LiveKitAPI(
            url=os.getenv("LIVEKIT_URL"),
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET")
        )
        self.outbound_trunk_id = os.getenv("SIP_OUTBOUND_TRUNK_ID")
        self.active_calls: Dict[str, Dict] = {}

    async def start_call(self, phone_number: str, session_id: str) -> Optional[str]:
        """
        Start a new outbound call
        Returns the room name if successful, None otherwise
        """
        try:
            # Create a unique room name using session_id
            room_name = f"call-{session_id}"
            logger.info(f"Creating room: {room_name}")

            # Create the room
            await self.lkapi.room.create_room(
                api.CreateRoomRequest(
                    name=room_name,
                    empty_timeout=300,  # 5 minutes timeout
                    max_participants=2   # Agent + Customer
                )
            )

            # Create SIP participant
            response = await self.lkapi.sip.create_sip_participant(
                api.CreateSIPParticipantRequest(
                    room_name=room_name,
                    sip_trunk_id=self.outbound_trunk_id,
                    sip_call_to=self._format_phone_number(phone_number),
                    participant_identity=phone_number,
                    wait_until_answered=True,
                )
            )

            # Track the call
            self.active_calls[room_name] = {
                "phone_number": phone_number,
                "session_id": session_id,
                "start_time": datetime.now().isoformat()
            }

            logger.info(f"Successfully started call to {phone_number} in room {room_name}")
            return room_name

        except Exception as e:
            error_message = str(e)
            logger.error(f"Error starting call: {error_message}")
            
            if "not answered" in error_message.lower():
                return "not_answered"
            elif "busy" in error_message.lower():
                return "busy"
            elif "invalid" in error_message.lower():
                return "invalid_number"
            return None

    async def end_call(self, room_name: str) -> bool:
        """End a call and clean up resources"""
        try:
            # Delete the room
            await self.lkapi.room.delete_room(room_name)
            
            # Update tracking
            if room_name in self.active_calls:
                self.active_calls[room_name]["end_time"] = datetime.now().isoformat()
                call_info = self.active_calls.pop(room_name)
                logger.info(f"Call ended for room {room_name}")
                return True
            return False

        except Exception as e:
            logger.error(f"Error ending call: {str(e)}")
            return False

    def _format_phone_number(self, phone_number: str) -> str:
        """Ensure phone number is in E.164 format"""
        # Remove any non-digit characters
        cleaned = ''.join(filter(str.isdigit, phone_number))
        
        # Add country code if not present
        if not cleaned.startswith('1'):  # Assuming US numbers
            cleaned = '1' + cleaned
            
        return f"+{cleaned}"

    async def get_call_status(self, room_name: str) -> Optional[Dict]:
        """Get status of an active call"""
        return self.active_calls.get(room_name)

    async def close(self):
        """Clean up all active calls"""
        for room_name in list(self.active_calls.keys()):
            await self.end_call(room_name) 