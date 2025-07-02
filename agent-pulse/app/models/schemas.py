from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# VAPI Webhook Schemas
class ToolCall(BaseModel):
    id: str
    type: str
    function: Dict[str, Any]

class ToolCallResult(BaseModel):
    name: str
    result: str
    toolCallId: str

class CallMessage(BaseModel):
    role: str
    message: Optional[str] = None
    time: Optional[float] = None
    endTime: Optional[float] = None
    secondsFromStart: Optional[float] = None
    duration: Optional[float] = None
    source: Optional[str] = None
    toolCalls: Optional[List[ToolCall]] = None
    name: Optional[str] = None
    toolCallId: Optional[str] = None

class CallArtifact(BaseModel):
    recordingEnabled: Optional[bool] = None
    recordingFormat: Optional[str] = None
    videoRecordingEnabled: Optional[bool] = None
    pcapEnabled: Optional[bool] = None
    pcapS3PathPrefix: Optional[str] = None
    transcriptPlan: Optional[Dict[str, Any]] = None
    recordingPath: Optional[str] = None

class CallAnalysis(BaseModel):
    summary: Optional[str] = None
    structuredData: Optional[Dict[str, Any]] = None
    structuredDataMulti: Optional[List[Dict[str, Any]]] = None
    successEvaluation: Optional[str] = None

class CallCost(BaseModel):
    type: str
    provider: Optional[str] = None
    minutes: Optional[float] = None
    cost: Optional[float] = None

class CallEvent(BaseModel):
    id: Optional[str] = None
    orgId: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    type: Optional[str] = None
    costs: Optional[List[CallCost]] = None
    messages: Optional[List[CallMessage]] = None
    phoneCallTransport: Optional[str] = None
    status: Optional[str] = None
    endedReason: Optional[str] = None
    destination: Optional[Dict[str, Any]] = None
    startedAt: Optional[str] = None
    endedAt: Optional[str] = None
    cost: Optional[float] = None
    costBreakdown: Optional[Dict[str, Any]] = None
    artifactPlan: Optional[CallArtifact] = None
    analysis: Optional[CallAnalysis] = None
    monitor: Optional[Dict[str, Any]] = None
    artifact: Optional[CallArtifact] = None
    assistantId: Optional[str] = None
    assistant: Optional[Dict[str, Any]] = None
    assistantOverrides: Optional[Dict[str, Any]] = None
    squadId: Optional[str] = None
    squad: Optional[Dict[str, Any]] = None
    workflowId: Optional[str] = None
    workflow: Optional[Dict[str, Any]] = None
    workflowOverrides: Optional[Dict[str, Any]] = None
    phoneNumberId: Optional[str] = None
    phoneNumber: Optional[Dict[str, Any]] = None
    customerId: Optional[str] = None
    customer: Optional[Dict[str, Any]] = None
    name: Optional[str] = None
    schedulePlan: Optional[Dict[str, Any]] = None
    transport: Optional[Dict[str, Any]] = None
    phoneCallProvider: Optional[str] = None
    phoneCallProviderId: Optional[str] = None

class CallReport(BaseModel):
    timestamp: str
    call_id: str
    ended_reason: Optional[str]
    transcript: Optional[str]
    summary: Optional[str]
    recording_url: Optional[str]
    raw_data: Dict[str, Any]

# API Request/Response Schemas
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    service: str

class CallInitiateRequest(BaseModel):
    call_id: Optional[int] = None

class CallInitiateResponse(BaseModel):
    message: str
    call_id: int
    vapi_response: Dict[str, Any]

class QuickCallResponse(BaseModel):
    message: str
    call_id: int
    service_record_id: int
    customer_name: str
    service_type: str
    vapi_response: Dict[str, Any]

class WebhookResponse(BaseModel):
    status: str
    message: str
    file_path: Optional[str] = None
    db_message: Optional[str] = None
    db_error: Optional[str] = None 