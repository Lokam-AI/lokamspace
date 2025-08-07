"""
AnyLLM service for AI analysis tasks with structured JSON schema support.
This service mirrors OpenAIService functionality but uses any-llm to support multiple LLM providers.
Supports: OpenAI, Anthropic, Mistral, Groq, and Ollama models.
"""

import logging
import json
import os
from typing import Dict, Any, List, Optional
from pathlib import Path
from app.core.config import settings
# Import any-llm with support for selected providers
from any_llm import completion

logger = logging.getLogger(__name__)

class AnyLLMService:
    def __init__(self):
        # Set API keys from settings for all supported providers
        # This ensures the keys are set from our config before any-llm attempts to use them
        
        # Set OpenAI API key and base URL
        if settings.OPENAI_API_KEY:
            os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY
        if settings.OPENAI_BASE_URL:
            os.environ["OPENAI_API_BASE"] = settings.OPENAI_BASE_URL
            
        # Set Anthropic API key
        if settings.ANTHROPIC_API_KEY:
            os.environ["ANTHROPIC_API_KEY"] = settings.ANTHROPIC_API_KEY
            
        # Set Mistral API key
        if settings.MISTRAL_API_KEY:
            os.environ["MISTRAL_API_KEY"] = settings.MISTRAL_API_KEY
            
        # Set Groq API key
        if settings.GROQ_API_KEY:
            os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY
            
        # Set Ollama API base
        if settings.OLLAMA_API_BASE:
            os.environ["OLLAMA_API_BASE"] = settings.OLLAMA_API_BASE

        # Load prompt templates on initialization
        self._prompt_templates = self._load_prompt_templates()
        self._prompt_metadata = self._load_prompt_metadata()

    def _load_prompt_metadata(self) -> Dict[str, Any]:
        """Load prompt metadata from JSON file for debugging/info purposes."""
        try:
            current_dir = Path(__file__).parent.parent.parent
            prompts_file = current_dir / "config" / "prompts.json"
            
            if not prompts_file.exists():
                return {}
            
            with open(prompts_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            # Extract metadata and version info
            metadata = {
                'version': config.get('version', 'unknown'),
                'description': config.get('description', ''),
                'default_version': config.get('default_version', 1),
                'available_prompts': {}
            }
            
            if 'prompts' in config:
                for version_str, prompt_data in config['prompts'].items():
                    try:
                        version_num = int(version_str)
                        metadata['available_prompts'][version_num] = {
                            'name': prompt_data.get('name', 'Unnamed'),
                            'description': prompt_data.get('description', '')
                        }
                    except ValueError:
                        continue
            
            return metadata
            
        except Exception as e:
            logger.error(f"Error loading prompt metadata: {e}")
            return {}

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
            version = 1  # Default to version 1 without relying on settings
        
        if version in self._prompt_templates:
            return self._prompt_templates[version]
        
        # Fallback to version 1 if specified version doesn't exist
        if 1 in self._prompt_templates:
            logger.warning(f"Prompt version {version} not found, falling back to version 1")
            return self._prompt_templates[1]
        
        # If no templates loaded, raise an error
        raise ValueError("No prompt templates loaded and no fallback available")

    def get_available_prompt_versions(self) -> Dict[str, Any]:
        """Get information about available prompt versions."""
        return {
            'metadata': self._prompt_metadata,
            'loaded_versions': list(self._prompt_templates.keys()),
            'default_version': self._prompt_metadata.get('default_version', 1)
        }

    async def analyze_call_transcript(
        self,
        transcript_messages: List[Dict[str, Any]],
        service_record_data: Dict[str, Any],
        organization_data: Dict[str, Any],
        tags: List[str],
        model: Optional[str] = None,
        prompt_version: Optional[int] = None
    ) -> Dict[str, Any]:
        prompt = self._build_analysis_prompt(
            transcript_messages, service_record_data, organization_data, tags, prompt_version
        )
        # Can we save the prompt in markdown file? with overwrite
        with open("prompt.md", "w") as f:
            f.write(prompt)

        # For OpenAI (default case), use the model name directly to match original behavior
        # For other providers, use the provider/model format
        if not model:
            # If no model specified, use the configured OpenAI model
            model_name = settings.OPENAI_MODEL
            provider = "openai"
            model_to_use = f"{provider}/{model_name}"
        elif '/' in model:
            # If model already has provider prefix
            provider = model.split('/')[0]
            model_to_use = model
        else:
            # If model specified without provider, assume OpenAI
            provider = "openai"
            model_to_use = f"{provider}/{model}"

        # Construct the message payload
        messages = [
            {
                "role": "system",
                "content": "You are a helpful assistant. Always respond with valid JSON matching the provided schema."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]

        # Create the JSON schema for the response format
        json_schema = {
            "type": "object",
            "properties": {
                "call_summary": {"type": "string"},
                "nps_score": {
                    "anyOf": [
                        {"type": "integer", "minimum": 0, "maximum": 10},
                        {"type": "null"}
                    ]
                },
                "overall_feedback": {"type": "string"},
                "positive_mentions": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "detractors": {
                    "type": "array",
                    "items": {"type": "string"}
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

        try:
            # Get provider from model string
            provider = model_to_use.split('/')[0] if '/' in model_to_use else 'openai'
            
            # JSON schema support varies by provider
            if provider == 'openai':
                # OpenAI has native JSON schema support
                # Match the exact format used in openai_service.py
                response = completion(
                    model=model_to_use,
                    messages=messages,
                    # Add max_tokens and temperature from settings
                    max_tokens=settings.OPENAI_MAX_TOKENS,
                    temperature=settings.OPENAI_TEMPERATURE,
                    response_format={
                        "type": "json_schema",
                        "json_schema": {
                            "name": "call_analysis",
                            "strict": True,
                            "schema": json_schema
                        }
                    }
                )
            elif provider in ['anthropic', 'mistral', 'groq', 'ollama']:
                # Non-OpenAI providers: We need to handle JSON schema differently
                # since they may not have native support for JSON schema format
                
                # First create a copy of the system message to avoid modifying the original
                enhanced_messages = [dict(messages[0]), messages[1]]
                
                # Add the JSON schema to the system message
                schema_str = json.dumps(json_schema, indent=2)
                enhanced_messages[0]["content"] += f"\n\nYou MUST respond with valid JSON matching this schema exactly: {schema_str}"
                enhanced_messages[0]["content"] += "\nDo not include any explanations or markdown formatting, just return the JSON."
                
                # Provider-specific optimizations for temperature
                if provider == 'ollama':
                    # Local models need even more explicit instructions
                    provider_temperature = 0.1  # Lowest temperature for most deterministic output
                else:
                    # Cloud models (Anthropic, Mistral, Groq)
                    # Use the configured temperature but slightly lower for better JSON formatting
                    provider_temperature = min(settings.OPENAI_TEMPERATURE, 0.2)
                
                response = completion(
                    model=model_to_use,
                    messages=enhanced_messages,
                    # Set max_tokens and temperature with provider-specific adjustments
                    max_tokens=settings.OPENAI_MAX_TOKENS,
                    temperature=provider_temperature
                )
            else:
                # Fallback for any unknown provider - try without special handling
                logger.warning(f"Unknown provider '{provider}'. Using default completion method.")
                response = completion(
                    model=model_to_use,
                    messages=messages,
                    # Still use the configured parameters
                    max_tokens=settings.OPENAI_MAX_TOKENS,
                    temperature=settings.OPENAI_TEMPERATURE
                )
            
            # Extract the content from the response (follows OpenAI format)
            content = response.choices[0].message.content
            return self._parse_analysis_result(content)

        except Exception as exc:
            # Match error handling in OpenAIService
            logger.error(f"AnyLLM API error: {exc}")
            # Add model info for debugging
            logger.error(f"Model: {model_to_use}")
            # In original OpenAIService, we also log the response text if available
            # Here we just re-raise the exception as in the original
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
            # Standard behavior - just like OpenAIService
            return json.loads(content)
        except json.JSONDecodeError as e:
            # For non-OpenAI models, we might need to clean up the response first
            # These providers might include markdown formatting, explanations, etc.
            logger.error("JSON parse error from AnyLLM response", exc_info=True)
            logger.error(f"Response content: {content}")
            
            # Try to extract valid JSON from the response (only for non-OpenAI providers)
            # This keeps original error behavior but adds fallback for other models
            cleaned_content = content
            
            # If response contains a code block, try to extract it
            if '```' in content:
                import re
                match = re.search(r'```(?:json)?(.*?)```', content, re.DOTALL)
                if match:
                    cleaned_content = match.group(1).strip()
                    try:
                        return json.loads(cleaned_content)
                    except:
                        # If that failed, fall through to default error behavior
                        pass
            
            # Return the same default structure as in OpenAIService
            return {
                "call_summary": "Error parsing response",
                "nps_score": None,
                "overall_feedback": "",
                "positive_mentions": [],
                "detractors": []
            }
