"""
OpenAI service for AI analysis tasks with structured JSON schema support.
"""

import logging
import httpx
import json
from typing import Dict, Any, List, Optional
from pathlib import Path
from app.core.config import settings

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        self.base_url = settings.OPENAI_BASE_URL or "https://api.openai.com/v1"
        self.headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        # Load prompt templates on initialization
        self._prompt_templates = self._load_prompt_templates()

    def _load_prompt_templates(self) -> Dict[int, str]:
        """Load prompt templates from external JSON file."""
        try:
            # Get the path to the prompts file relative to the server directory
            current_dir = Path(__file__).parent.parent.parent  # Go up to server directory
            prompts_file = current_dir / "config" / "prompts.json"
            
            if not prompts_file.exists():
                logger.warning(f"Prompts file not found at {prompts_file}. Using default prompt.")
                return {}
            
            with open(prompts_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            # Extract prompt templates from the JSON structure
            prompts = {}
            if 'prompts' in config:
                for version_str, prompt_data in config['prompts'].items():
                    try:
                        version_num = int(version_str)
                        if 'template' in prompt_data:
                            prompts[version_num] = prompt_data['template']
                            logger.debug(f"Loaded prompt version {version_num}: {prompt_data.get('name', 'Unnamed')}")
                        else:
                            logger.warning(f"No 'template' field found in prompt version {version_str}")
                    except ValueError as e:
                        logger.warning(f"Invalid version number '{version_str}': {e}")
                        continue
            
            logger.info(f"Loaded {len(prompts)} prompt templates from {prompts_file}")
            return prompts
            
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON format in prompts file: {e}")
            return {}
        except Exception as e:
            logger.error(f"Error loading prompt templates: {e}")
            return {}

    def _get_prompt_template(self, version: Optional[int] = None) -> str:
        """Get prompt template for specified version or default to version 1."""
        if version is None:
            version = 1  # Default to version 1
        
        if version in self._prompt_templates:
            return self._prompt_templates[version]
        
        # Fallback to version 1 if specified version doesn't exist
        if 1 in self._prompt_templates:
            logger.warning(f"Prompt version {version} not found, falling back to version 1")
            return self._prompt_templates[1]
        
        # If no templates loaded, raise an error
        raise ValueError("No prompt templates loaded and no fallback available")

    async def analyze_call_transcript(
        self,
        transcript_messages: List[Dict[str, Any]],
        service_record_data: Dict[str, Any],
        organization_data: Dict[str, Any],
        tags: List[str],
        prompt_version: Optional[int] = None
    ) -> Dict[str, Any]:
        prompt = self._build_analysis_prompt(
            transcript_messages, service_record_data, organization_data, tags, prompt_version
        )
        # Can we save the prompt in markdown file? with overwrite
        if settings.ENVIRONMENT == "development":
            with open("prompt.md", "w") as f:
                f.write(prompt)

        payload = {
            "model": settings.OPENAI_MODEL,  # must be a gpt-4o model (e.g., "gpt-4o-2024-08-06")
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert call transcript analyst specializing in customer service evaluation for automotive and service businesses. Your expertise includes sentiment analysis, NPS score extraction, and customer experience assessment. You must always respond with valid JSON that strictly adheres to the provided schema. Focus on accuracy, consistency, and extracting actionable insights from customer conversations. Never include explanations, markdown formatting, or any text outside the required JSON structure."
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
        tags: List[str],
        prompt_version: Optional[int] = None
    ) -> str:
        # Prepare the data for template formatting
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

        # Define the output schema
        output_schema = """json
{
  "call_summary": "<string>",
  "nps_score": <integer|null>,
  "overall_feedback": "<string>",
  "positive_mentions": ["<tag1>", "..."],
  "detractors": ["<tag2>", "..."]
}"""

        # Get the prompt template for the specified version
        prompt_template = self._get_prompt_template(prompt_version)
        
        # Format the template with the actual data
        formatted_prompt = prompt_template.format(
            formatted_transcript=formatted_transcript,
            service_record_json=service_record_json,
            organization_json=organization_json,
            formatted_tags=formatted_tags,
            output_schema=output_schema
        )
        return formatted_prompt


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