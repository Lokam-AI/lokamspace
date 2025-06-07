from livekit import api
from ..core.config import get_settings

settings = get_settings()

class LiveKitService:
    def __init__(self) -> None:
        # LiveKitAPI bundles every server service (room, sip, ingress…)
        self.lk = api.LiveKitAPI(
            url=settings.LIVEKIT_URL,
            api_key=settings.LIVEKIT_API_KEY,
            api_secret=settings.LIVEKIT_API_SECRET,
        )

    async def create_sip_call(
        self,
        room_name: str,
        phone_number: str,
        customer_id: str,
        customer_name: str,
    ) -> api.sip_service.SIPParticipantInfo:
        req = api.sip_service.CreateSIPParticipantRequest(
            room_name=room_name,
            sip_trunk_id=settings.LIVEKIT_SIP_TRUNK_ID,
            sip_call_to=phone_number,
            participant_identity=str(customer_id),
            participant_name=customer_name,
            wait_until_answered=True,
        )
        return await self.lk.sip.create_sip_participant(req)


livekit_service = LiveKitService() 