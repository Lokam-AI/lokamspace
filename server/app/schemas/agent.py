"""
Agent library schemas.
"""

from typing import List, Optional
from pydantic import BaseModel


class Agent(BaseModel):
    id: str
    name: str
    description: str
    category: str
    language: str
    country: str
    voice_id: str
    personality: Optional[str] = None
    capabilities: Optional[List[str]] = None
    is_active: bool = True


class AgentsResponse(BaseModel):
    agents: List[Agent]


class AgentResponse(BaseModel):
    agent: Agent


class AgentTestCallResponse(BaseModel):
    call_id: str
    status: str
    message: str
    estimated_duration: Optional[int] = None

