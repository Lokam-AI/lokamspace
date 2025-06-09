from livekit import api
from ..core.config import get_settings
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

class LiveKitService:
    def __init__(self) -> None:
        # LiveKitAPI bundles every server service (room, sip, ingress…)
        self.lk = api.LiveKitAPI(
            url=settings.LIVEKIT_URL,
            api_key=settings.LIVEKIT_API_KEY,
            api_secret=settings.LIVEKIT_API_SECRET,
        )
        logger.info(f"LiveKit Service initialized with URL: {settings.LIVEKIT_URL}")
        logger.info(f"Using SIP Trunk ID: {settings.LIVEKIT_SIP_TRUNK_ID}")

    def _format_phone_number(self, phone_number: str) -> str:
        """Ensure phone number is in E.164 format"""
        # Remove any non-digit characters
        cleaned = ''.join(filter(str.isdigit, phone_number))
        
        # Add country code if not present
        if not cleaned.startswith('1'):  # Assuming US numbers
            cleaned = '1' + cleaned
            
        formatted = f"+{cleaned}"
        logger.info(f"Formatted phone number from {phone_number} to {formatted}")
        return formatted

    async def create_sip_call(
        self,
        room_name: str,
        phone_number: str,
        customer_id: str,
        customer_name: str,
        metadata: dict = None,
    ) -> api.sip_service.SIPParticipantInfo:
        # Log all input parameters
        logger.info("Creating SIP call with parameters:")
        logger.info(f"Room Name: {room_name}")
        logger.info(f"Original Phone Number: {phone_number}")
        logger.info(f"Customer ID: {customer_id}")
        logger.info(f"Customer Name: {customer_name}")
        logger.info(f"Metadata: {metadata}")
        
        # Format the phone number to E.164
        formatted_phone = self._format_phone_number(phone_number)
        
        # Create the request
        req = api.sip_service.CreateSIPParticipantRequest(
            room_name=room_name,
            sip_trunk_id=settings.LIVEKIT_SIP_TRUNK_ID,
            sip_call_to=formatted_phone,
            participant_identity=str(customer_id),
            participant_name=customer_name,
            participant_metadata=metadata and str(metadata),
            wait_until_answered=True,
        )
        
        # Log the final request
        logger.info("Sending SIP participant request:")
        logger.info(f"SIP Trunk ID: {settings.LIVEKIT_SIP_TRUNK_ID}")
        logger.info(f"Formatted Phone: {formatted_phone}")
        
        try:
            response = await self.lk.sip.create_sip_participant(req)
            logger.info(f"Successfully created SIP participant: {response}")
            return response
        except Exception as e:
            logger.error(f"Error creating SIP participant: {str(e)}")
            raise


livekit_service = LiveKitService() 