import logging
import asyncio
import json
import random
from datetime import datetime
from typing import Dict, Any, Optional
from livekit import api
from app.config import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("garagebot.telephony")

settings = get_settings()

class TelephonyService:
    def __init__(self):
        self.lkapi = api.LiveKitAPI(
            url=settings.LIVEKIT_URL,
            api_key=settings.LIVEKIT_API_KEY,
            api_secret=settings.LIVEKIT_API_SECRET
        )
        self.active_calls: Dict[str, Dict[str, Any]] = {}

    async def start_call(self, phone_number: str) -> Dict[str, Any]:
        """
        Initialize a new call session with LiveKit
        """
        try:
            # Validate phone number format
            phone_number = self._format_phone_number(phone_number)
            if not self._validate_phone_number(phone_number):
                raise ValueError("Invalid phone number format")

            # Generate unique room name
            room_name = f"call-{datetime.now().strftime('%Y%m%d')}-{''.join(str(random.randint(0, 9)) for _ in range(6))}"
            
            # Create room
            await self.lkapi.room.create_room(
                api.CreateRoomRequest(
                    name=room_name,
                    empty_timeout=300,  # 5 minutes
                    max_participants=2   # Just the agent and the customer
                )
            )

            # Store call information
            call_info = {
                "id": room_name,
                "phone_number": phone_number,
                "status": "initiated",
                "start_time": datetime.now().isoformat(),
                "room_name": room_name
            }
            self.active_calls[room_name] = call_info

            # Create SIP participant
            await self._create_sip_participant(room_name, phone_number)

            logger.info(f"Call initiated to {phone_number} in room {room_name}")
            return call_info

        except Exception as e:
            logger.error(f"Failed to start call: {str(e)}")
            raise Exception(f"Failed to start call: {str(e)}")

    async def get_call_status(self, call_id: str) -> str:
        """
        Get the current status of a call
        """
        try:
            if call_id not in self.active_calls:
                raise ValueError("Call not found")

            # Get room status from LiveKit
            room_info = await self.lkapi.room.list_rooms(
                api.ListRoomsRequest(names=[self.active_calls[call_id]["room_name"]])
            )

            if not room_info.rooms:
                self.active_calls[call_id]["status"] = "ended"
            else:
                room = room_info.rooms[0]
                if room.num_participants == 0:
                    self.active_calls[call_id]["status"] = "ended"
                elif room.num_participants == 1:
                    self.active_calls[call_id]["status"] = "connecting"
                else:
                    self.active_calls[call_id]["status"] = "in_progress"

            return self.active_calls[call_id]["status"]

        except Exception as e:
            logger.error(f"Failed to get call status: {str(e)}")
            raise Exception(f"Failed to get call status: {str(e)}")

    async def end_call(self, call_id: str) -> None:
        """
        End an active call
        """
        try:
            if call_id not in self.active_calls:
                raise ValueError("Call not found")

            room_name = self.active_calls[call_id]["room_name"]
            
            # Delete the room in LiveKit
            await self.lkapi.room.delete_room(
                api.DeleteRoomRequest(room=room_name)
            )

            # Update call status
            self.active_calls[call_id]["status"] = "ended"
            self.active_calls[call_id]["end_time"] = datetime.now().isoformat()

            logger.info(f"Call {call_id} ended successfully")

        except Exception as e:
            logger.error(f"Failed to end call: {str(e)}")
            raise Exception(f"Failed to end call: {str(e)}")

    async def _create_sip_participant(self, room_name: str, phone_number: str) -> None:
        """
        Create a SIP participant for the call
        """
        try:
            await self.lkapi.sip.create_sip_participant(
                api.CreateSIPParticipantRequest(
                    room_name=room_name,
                    sip_trunk_id=settings.LIVEKIT_SIP_TRUNK_ID,
                    sip_call_to=phone_number,
                    participant_identity=phone_number,
                    wait_until_answered=True
                )
            )
        except Exception as e:
            logger.error(f"Failed to create SIP participant: {str(e)}")
            raise Exception(f"Failed to create SIP participant: {str(e)}")

    def _format_phone_number(self, phone_number: str) -> str:
        """
        Format phone number to E.164 format
        
        Args:
            phone_number: The phone number to format
            
        Returns:
            Formatted phone number in E.164 format
            
        Example:
            8281013561 -> +18281013561
            +918281013561 -> +918281013561
            918281013561 -> +918281013561
        """
        # Remove any non-digit characters except plus
        digits = ''.join(c for c in phone_number if c.isdigit() or c == '+')
        
        # If number starts with +, keep it as is
        if digits.startswith('+'):
            return digits
        
        # If number starts with country code (91 for India)
        if digits.startswith('91') and len(digits) > 2:
            return f"+{digits}"
        
        # For numbers without country code, assume India (+91)
        if len(digits) == 10:
            return f"+91{digits}"
        
        raise ValueError(
            "Invalid phone number format. Expected formats: "
            "10 digits (8281013561), "
            "with country code (918281013561), "
            "or with + and country code (+918281013561)"
        )

    def _validate_phone_number(self, phone_number: str) -> bool:
        """
        Validate phone number format
        
        Args:
            phone_number: The phone number to validate
            
        Returns:
            bool: True if valid, False otherwise
        """
        import re
        # Matches:
        # +91XXXXXXXXXX (Indian numbers with + prefix)
        # +1XXXXXXXXXX (US numbers)
        pattern = r'^\+(?:91|1)\d{10}$'
        return bool(re.match(pattern, phone_number)) 