from pydantic import BaseModel
from typing_extensions import Annotated
from pydantic import constr

class CallRequest(BaseModel):
    phone_number: Annotated[str, constr(pattern=r'^\+?1?\d{9,15}$')]  # Basic phone number validation

class CallResponse(BaseModel):
    call_id: str
    status: str

class CallStatus(BaseModel):
    call_id: str
    status: str
    duration: int | None = None
    transcription: str | None = None 