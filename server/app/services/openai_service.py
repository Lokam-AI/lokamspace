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

        output_schema = """
    \"\"\"json
    {
    "call_summary": "<string>",
    "nps_score": <integer|null>,
    "overall_feedback": "<string>",
    "positive_mentions": ["<tag1>", "..."],
    "detractors": ["<tag2>", "..."]
    }
    \"\"\""""

        return f"""
    ## --- ROLE ---
    You are an expert conversation analyzer. Always respond with valid JSON matching exactly the schema given—no extra text or metadata.

    ## --- INPUT — TRANSCRIPT & CONTEXT —
    Call Transcript:
    {formatted_transcript}

    Service Record Info:
    ```json
    {service_record_json}
    ```

    Organization Info:
    ```json
    {organization_json}
    ```

    Focus Tags: {formatted_tags}

    ## --- TASK INSTRUCTIONS — STEP-BY-STEP —
    Follow this reasoning internally and make your final JSON concise and strict:

    **Step 1 - Summarize call outcome in one sentence.**

    **Step 2 - Locate an NPS score (0-10):**
    - If a number in that range is uttered explicitly (“NPS: 8”, “I'd give you a 9”), record that.
    - If phrased indirectly (“That's top-tier service”) interpret to the most appropriate numeric equivalent (e.g. 9-10), but only if clearly implied.
    - If unclear or not stated, set to `null`.

    **Step 3 - Overall feedback:** Write 1-2 sentences reflecting customer sentiment.

    **Step 4 - For each focus tag:**
    - If mentioned positively (praise, enjoyment, satisfaction), include in `positive_mentions`.
    - If mentioned negatively (issue, complaint, dissatisfaction), include in `detractors`.
    - If not clearly mentioned, exclude.

    ### Few-Shot Examples:

    --Example A--
    Transcript:
    Customer: “I'd say my experience was a 9 — amazing service.”
    Tags: “timeliness, cleanliness, communication”

    Output:
    {{
    "call_summary": "Customer gave exceptionally positive feedback.",
    "nps_score": 9,
    "overall_feedback": "Customer rated the experience very highly and expressed satisfaction across all areas.",
    "positive_mentions": ["timeliness","communication"],
    "detractors": []
    }}

    --Example B--
    Transcript:
    Customer: “Honestly it was okay, nothing stood out, but the pickup was late.”
    Tags: “timeliness, professionalism, value”

    Output:
    {{
    "call_summary": "Customer had mixed feelings, noting a delay in pickup.",
    "nps_score": null,
    "overall_feedback": "Customer felt neutral overall but was disappointed by the pickup delay.",
    "positive_mentions": [],
    "detractors": ["timeliness"]
    }}

    ## --- OUTPUT SCHEMA ---
    {output_schema}

    Respond with only the valid JSON object.
    """

    async def summarize_daily_activities(
        self,
        organization_data: Dict[str, Any],
        activity_data: Dict[str, Any],
        date_str: str
    ) -> List[Dict[str, Any]]:
        """
        Generate AI-powered summaries for daily activities based on organization data.
        
        Args:
            organization_data: Organization information and context
            activity_data: Raw activity data including calls, feedback, service records
            date_str: Date for which activities are being generated
            
        Returns:
            List[Dict[str, Any]]: List of summarized activities with AI-generated descriptions
        """
        prompt = self._build_activity_summary_prompt(organization_data, activity_data, date_str)
        
        # Save prompt for debugging (optional)
        try:
            with open("activity_summary_prompt.md", "w") as f:
                f.write(prompt)
        except Exception:
            pass  # Don't fail if we can't write debug file

        payload = {
            "model": settings.OPENAI_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert business analyst specializing in automotive service center operations. Generate concise, actionable activity summaries that provide meaningful insights for service center managers."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "activity_summaries",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "activities": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "type": {"type": "string"},
                                        "title": {"type": "string"},
                                        "description": {"type": "string"},
                                        "priority": {"type": "integer"}
                                    },
                                    "required": ["type", "title", "description", "priority"],
                                    "additionalProperties": False
                                }
                            }
                        },
                        "required": ["activities"],
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
                result = self._parse_activity_summary_result(content)
                return result.get("activities", [])

        except httpx.HTTPError as exc:
            logger.error(f"OpenAI API error in activity summarization: {exc}")
            if exc.response is not None:
                logger.error(exc.response.text)
            # Return fallback activities on error
            return self._get_fallback_ai_activities()
        except Exception as exc:
            logger.error(f"Unexpected error in activity summarization: {exc}")
            return self._get_fallback_ai_activities()

    def _build_activity_summary_prompt(
        self,
        organization_data: Dict[str, Any],
        activity_data: Dict[str, Any],
        date_str: str
    ) -> str:
        """Build the prompt for AI activity summarization."""
        
        organization_json = json.dumps({
            "name": organization_data.get('name', 'Service Center'),
            "description": organization_data.get('description', 'Automotive service center'),  
            "service_center_description": organization_data.get('service_center_description', ''),
            "location": organization_data.get('location', 'N/A'),
            "focus_areas": organization_data.get('focus_areas', [])
        }, indent=2)
        
        activity_json = json.dumps(activity_data, indent=2)
        
        output_schema = '''
```json
{
  "activities": [
    {
      "type": "promoters|detractors|feedback|service_records|other",
      "title": "Brief activity title (max 4 words)",
      "description": "Detailed insight with specific numbers and context (max 80 chars)",
      "priority": 3
    }
  ]
}
```'''

        return f"""
## 📊 Daily Activity Summarization Task

Generate exactly 3 intelligent activity summaries for a service center based on the data below. Focus on actionable insights that help managers understand what happened and what actions might be needed.

### 📌 Input Data

**Date:** {date_str}

**Organization Info:**
```json
{organization_json}
```

**Activity Data:**
```json
{activity_json}
```

### 🎯 Task Instructions

Create exactly 3 activities that provide the most valuable insights from the data:

1. **Prioritize impact**: Focus on activities that have business implications
2. **Be specific**: Include actual numbers and context in descriptions  
3. **Actionable insights**: Descriptions should hint at what actions might be needed
4. **Varied types**: Try to cover different aspects (customer satisfaction, operational efficiency, service quality)

**Priority Guidelines:**
- Priority 3: High-impact customer satisfaction insights (promoters/detractors)
- Priority 4-6: Operational insights (service records, feedback patterns)

**Description Guidelines:**
- Start with the insight, then provide context
- Include specific numbers when available
- Keep under 80 characters
- Examples:
  - "Customer satisfaction up with 5 promoters praising quick service"
  - "3 detractors cited long wait times, action needed on scheduling"
  - "Service completion rate improved: 12 records completed efficiently"

### 📋 Output Schema
{output_schema}

Generate exactly 3 activities. Focus on the most impactful insights from the available data.
"""

    def _parse_activity_summary_result(self, content: str) -> Dict[str, Any]:
        """Parse the AI response for activity summaries."""
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            logger.error("JSON parse error from OpenAI activity summary response", exc_info=True)
            logger.error(f"Response content: {content}")
            return {"activities": self._get_fallback_ai_activities()}

    def _get_fallback_ai_activities(self) -> List[Dict[str, Any]]:
        """Get fallback activities when AI summarization fails."""
        return [
            {
                "type": "system_analysis",
                "title": "Data Analysis",
                "description": "System analyzed daily metrics and trends for insights",
                "priority": 5
            },
            {
                "type": "service_summary", 
                "title": "Service Overview",
                "description": "Daily service operations completed successfully",
                "priority": 6
            },
            {
                "type": "feedback_review",
                "title": "Feedback Review", 
                "description": "Customer feedback patterns reviewed for improvements",
                "priority": 7
            }
        ]

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
