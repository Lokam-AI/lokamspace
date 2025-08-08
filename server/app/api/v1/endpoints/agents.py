"""
Agents library endpoints backed by a JSON file until DB is introduced.
"""

import json
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, status

from app.schemas.agent import (
    Agent,
    AgentsResponse,
    AgentResponse,
    AgentTestCallResponse,
)


router = APIRouter()


def _load_agent_library() -> Dict[str, Any]:
    # Resolve to repository/server/data/agent_library.json
    data_path = Path(__file__).resolve().parents[4] / "data" / "agent_library.json"
    if not data_path.exists():
        # Return empty structure if file missing
        return {"agents": [], "categories": []}
    try:
        with data_path.open("r", encoding="utf-8") as f:
            raw = f.read().strip()
            if not raw:
                return {"agents": [], "categories": []}
            return json.loads(raw)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load agent library: {e}",
        )


@router.get("", response_model=AgentsResponse)
def get_agents() -> Any:
    data = _load_agent_library()
    sanitized: List[Dict[str, Any]] = []
    for a in data.get("agents", []):
        # Accept both old and new shapes; normalize to minimal payload
        category_value = a.get("category")
        if isinstance(category_value, dict):
            category_value = category_value.get("name")
        sanitized.append(
            {
                "id": a.get("id", ""),
                "name": a.get("name", ""),
                "description": a.get("description", ""),
                "category": category_value or "",
                "language": a.get("language", ""),
                "country": a.get("country", ""),
                "voice_id": a.get("voice_id", a.get("id", "")),
                "personality": a.get("personality", ""),
                "capabilities": a.get("capabilities", []),
                "is_active": bool(a.get("is_active", True)),
            }
        )
    # Validate via Pydantic for response consistency
    agents: List[Agent] = [Agent(**s) for s in sanitized]
    return {"agents": agents}



@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent_by_id(agent_id: str) -> Any:
    data = _load_agent_library()
    for a in data.get("agents", []):
        if str(a.get("id")) == agent_id or str(a.get("voice_id")) == agent_id:
            category_value = a.get("category")
            if isinstance(category_value, dict):
                category_value = category_value.get("name")
            sanitized = {
                "id": a.get("id", ""),
                "name": a.get("name", ""),
                "description": a.get("description", ""),
                "category": category_value or "",
                "language": a.get("language", ""),
                "country": a.get("country", ""),
                "voice_id": a.get("voice_id", a.get("id", "")),
                "personality": a.get("personality", ""),
                "capabilities": a.get("capabilities", []),
                "is_active": bool(a.get("is_active", True)),
            }
            return {"agent": Agent(**sanitized)}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")


@router.post("/{agent_id}/test-call", response_model=AgentTestCallResponse)
def initiate_agent_test_call(agent_id: str) -> Any:
    # Static stub until integrated with real call flow
    data = _load_agent_library()
    if not any(
        str(a.get("id")) == agent_id or str(a.get("voice_id")) == agent_id
        for a in data.get("agents", [])
    ):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return {
        "call_id": f"test-{agent_id}",
        "status": "initiated",
        "message": "Test call has been initiated (stub)",
        "estimated_duration": 120,
    }

