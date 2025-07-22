"""
OpenAI service for AI analysis tasks with structured JSON schema support.
"""

import logging
import httpx
import json
from typing import Dict, Any, List
from app.core.config import settings

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        self.base_url = settings.OPENAI_BASE_URL or "https://api.openai.com/v1"
        self.headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }

    async def analyze_call_transcript(
        self,
        transcript_messages: List[Dict[str, Any]],
        service_record_data: Dict[str, Any],
        organization_data: Dict[str, Any],
        tags: List[str]
    ) -> Dict[str, Any]:
        prompt = self._build_analysis_prompt(
            transcript_messages, service_record_data, organization_data, tags
        )
        # Can we save the prompt in markdown file? with overwrite
        with open("prompt.md", "w") as f:
            f.write(prompt)

        payload = {
            "model": settings.OPENAI_MODEL,  # must be a gpt-4o model (e.g., "gpt-4o-2024-08-06")
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful assistant. Always respond with valid JSON matching the provided schema."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "call_analysis",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "call_summary": { "type": "string" },
                            "nps_score": {
                                "anyOf": [
                                    { "type": "integer", "minimum": 0, "maximum": 10 },
                                    { "type": "null" }
                                ]
                            },
                            "overall_feedback": { "type": "string" },
                            "positive_mentions": {
                                "type": "array",
                                "items": { "type": "string" }
                            },
                            "detractors": {
                                "type": "array",
                                "items": { "type": "string" }
                            }
                        },
                        "required": [
                            "call_summary",
                            "nps_score",
                            "overall_feedback",
                            "positive_mentions",
                            "detractors"
                        ],
                        "additionalProperties": False
                    }
                }
            }
        }



        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{self.base_url}/chat/completions",
                    json=payload,
                    headers=self.headers
                )
                resp.raise_for_status()
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                return self._parse_analysis_result(content)

        except httpx.HTTPError as exc:
            logger.error(f"OpenAI API error: {exc}")
            if exc.response is not None:
                logger.error(exc.response.text)
            raise

    def _build_analysis_prompt(
        self,
        transcript_messages: List[Dict[str, Any]],
        service_record_data: Dict[str, Any],
        organization_data: Dict[str, Any],
        tags: List[str]
    ) -> str:
        formatted_transcript = "\n".join(
            f"{m['role']}: {m['message']}" for m in transcript_messages
        )
        formatted_tags = ", ".join(tags)
        org_focus = ", ".join(organization_data.get("focus_areas", []) or [])
        org_improve = ", ".join(organization_data.get("areas_to_improve", []) or [])
        
        # Create JSON strings directly using json.dumps to avoid string formatting issues
        service_record_json = json.dumps({
            "customer_name": service_record_data.get('customer_name', 'N/A'),
            "service_type": service_record_data.get('service_type', 'N/A'),
            "vehicle_info": service_record_data.get('vehicle_info', 'N/A'),
            "service_advisor_name": service_record_data.get('service_advisor_name', 'N/A')
        }, indent=2)
        
        organization_json = json.dumps({
            "company": organization_data.get('name', 'N/A'),
            "description": organization_data.get('description', 'N/A'),
            "service_center": organization_data.get('service_center_description', 'N/A'),
            "focus_tags": formatted_tags,
            "location": organization_data.get('location', 'N/A')
        }, indent=2)
        
        # Define output schema as a separate string to avoid f-string issues
        output_schema = '''
```json
{
  "call_summary": "<string>",
  "nps_score": <integer|null>,
  "overall_feedback": "<string>",
  "positive_mentions": ["<tag1>", "..."],
  "detractors": ["<tag2>", "..."]
}
```'''

        return f"""
## 🎧 After‑Call Analysis Task

You are an expert assistant. Analyze the following call transcript and output **exactly** the JSON described—no extra text, comments, or formatting. Be concise, factual, and adhere strictly to the schema.

### 📌 Input

**Call Transcript:**  
{formatted_transcript}

**Service Record Info:**  
```json
{service_record_json}
```

## Organization Info:
```json
{organization_json}
```


## Task Instructions:
1. Summarize the call: write a single-sentence summary capturing key outcome.
2. Extract NPS score: integer 0-10 if spoken in transcript, otherwise null.
3. Overall feedback: provide a 1-2 sentence narrative reflecting sentiment.
4. Positive mentions: list each focus tag mentioned positively.
5. Detractors: list each focus tag mentioned negatively or as an issue.
    - Only tags present in focus_tags.
    - Exclude neutral or unmentioned tags.


## Output Schema:
{output_schema}

Respond with valid JSON exactly matching the schema.
"""

    def _parse_analysis_result(self, content: str) -> Dict[str, Any]:
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            logger.error("JSON parse error from OpenAI response", exc_info=True)
            logger.error(f"Response content: {content}")
            return {
                "call_summary": "Error parsing response",
                "nps_score": None,
                "overall_feedback": "",
                "positive_mentions": [],
                "detractors": []
            }
