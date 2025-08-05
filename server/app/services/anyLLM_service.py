"""
AnyLLM service for AI analysis tasks with structured JSON schema support.
This service mirrors OpenAIService functionality but uses any-llm to support multiple LLM providers.
Supports: OpenAI, Anthropic, Mistral, Groq, and Ollama models.
"""

import logging
import json
import os
from typing import Dict, Any, List, Optional
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

    async def analyze_call_transcript(
        self,
        transcript_messages: List[Dict[str, Any]],
        service_record_data: Dict[str, Any],
        organization_data: Dict[str, Any],
        tags: List[str],
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        prompt = self._build_analysis_prompt(
            transcript_messages, service_record_data, organization_data, tags
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

        # Define the output schema
        output_schema = """json
{
  "call_summary": "<string>",
  "nps_score": <integer|null>,
  "overall_feedback": "<string>",
  "positive_mentions": ["<tag1>", "..."],
  "detractors": ["<tag2>", "..."]
}"""
        
        # Return the formatted prompt
        return f"""
```

## --- ROLE DEFINITION ---

You are a highly capable AI specializing in **call transcript analysis** and **customer sentiment extraction** for service-oriented businesses. Your task is to produce **valid JSON** that adheres **exactly** to the provided schema.

## --- AVAILABLE INPUTS ---

You are given three structured data blocks:

1. **Call Transcript** (Role-tagged customer conversation):

```
{formatted_transcript}
```

2. **Service Record Info** (Prior records and interactions in JSON format):

```json
{service_record_json}
```

3. **Organization Info** (Company profile in JSON):

```json
{organization_json}
```

4. **Focus Tags** (aspects to analyze):

```
{formatted_tags}
```

---

## --- TASK OBJECTIVE ---

Your goal is to analyze the **customer conversation** and extract structured insights in JSON based on the schema provided.

---

## --- INTERNAL REASONING STEPS (Chain-of-Thought) ---

1. **Summarize the Call Outcome in One Sentence**

   * Focus on the customer's final sentiment and the resolution status.

2. **Infer NPS Score (0–10):**

   * If a score is explicitly stated (e.g., "I'd give it an 8"), extract it as-is.
   * If implied ("Fantastic service!"), interpret reasonably:

     * Highly positive (9–10), somewhat positive (7–8), neutral (4–6), negative (0–3).
   * If unclear or uncertain, return `null`.

3. **Summarize Overall Feedback (1–2 lines):**

   * Reflect the **emotional tone** and **general experience** of the customer.

4. **Classify Each Focus Tag:**

   * If tag is clearly mentioned **positively**, add to `"positive_mentions"`.
   * If mentioned **negatively**, add to `"detractors"`.
   * If ambiguous or not mentioned, exclude from both lists.

---

## --- FEW-SHOT EXAMPLES ---

### Example A:

**Transcript:**
Customer: "It was perfect, I'd rate it a 10. Super fast response and really helpful."
**Tags:** `communication, response time, transparency`

**Output:**

```json
{{
  "call_summary": "Customer expressed delight with the fast and helpful service.",
  "nps_score": 10,
  "overall_feedback": "Customer was highly satisfied and praised the quick response.",
  "positive_mentions": ["communication", "response time"],
  "detractors": []
}}
```

### Example B:

**Transcript:**
Customer: "Pickup was delayed and nobody told me. The mechanic was okay, I guess."
**Tags:** `timeliness, communication, professionalism`

**Output:**

```json
{{
  "call_summary": "Customer was dissatisfied with the lack of communication and delays.",
  "nps_score": null,
  "overall_feedback": "Customer was frustrated with the delay and lack of updates.",
  "positive_mentions": [],
  "detractors": ["timeliness", "communication"]
}}
```

### Example C:

**Transcript:**
Customer: "The technician was great and explained everything clearly. Bit of a wait though."
**Tags:** `professionalism, wait time, communication`

**Output:**

```json
{{
  "call_summary": "Customer praised technician's clarity but noted delay.",
  "nps_score": 8,
  "overall_feedback": "Customer had a good experience overall with minor delay concerns.",
  "positive_mentions": ["communication", "professionalism"],
  "detractors": ["wait time"]
}}
```

### Example D:

**Transcript:**
Customer: "No updates until I called three times. I wouldn't recommend this."
**Tags:** `transparency, responsiveness, satisfaction`

**Output:**

```json
{{
  "call_summary": "Customer was extremely dissatisfied with lack of updates.",
  "nps_score": 2,
  "overall_feedback": "Customer felt ignored and expressed strong dissatisfaction.",
  "positive_mentions": [],
  "detractors": ["transparency", "responsiveness", "satisfaction"]
}}
```

### Example E:

**Transcript:**
Customer: "I liked the reminder call before the appointment. Very professional."
**Tags:** `professionalism, scheduling, communication`

**Output:**

```json
{{
  "call_summary": "Customer appreciated the reminder and professionalism.",
  "nps_score": 9,
  "overall_feedback": "Customer was happy with the smooth appointment process.",
  "positive_mentions": ["communication", "professionalism", "scheduling"],
  "detractors": []
}}
```

### Example F:

**Transcript:**
Customer: "Your technician arrived on time and fixed the issue in under an hour. I'm impressed with how knowledgeable he was."
**Tags:** `timeliness, expertise, efficiency, courtesy`

**Output:**

```json
{{
  "call_summary": "Customer was impressed with the technician's punctuality and knowledge.",
  "nps_score": 9,
  "overall_feedback": "Customer had an excellent experience with prompt service and efficient problem resolution.",
  "positive_mentions": ["timeliness", "expertise", "efficiency"],
  "detractors": []
}}
```

### Example G:

**Transcript:**
Customer: "While the repair was done correctly, I had to wait an extra day because of parts availability. The staff was apologetic though."
**Tags:** `repair quality, timeliness, communication, parts availability`

**Output:**

```json
{{
  "call_summary": "Customer satisfied with repair quality despite delay due to parts.",
  "nps_score": 6,
  "overall_feedback": "Customer acknowledged good repair work but experienced frustration with the extended timeline.",
  "positive_mentions": ["repair quality", "communication"],
  "detractors": ["timeliness", "parts availability"]
}}
```

### Example H:

**Transcript:**
Customer: "The work was expensive but worth every penny. Your team went above and beyond to fix issues I didn't even know about."
**Tags:** `pricing, value, thoroughness, expertise`

**Output:**

```json
{{
  "call_summary": "Customer found service expensive but valuable due to thorough work.",
  "nps_score": 8,
  "overall_feedback": "Customer expressed high satisfaction with thoroughness despite high cost, indicating good perceived value.",
  "positive_mentions": ["value", "thoroughness", "expertise"],
  "detractors": ["pricing"]
}}
```

### Example I:

**Transcript:**
Customer: "I've been coming here for years and have never been disappointed. Today was no exception - quick service, fair price."
**Tags:** `loyalty, timeliness, pricing, satisfaction`

**Output:**

```json
{{
  "call_summary": "Long-time customer expressed continued satisfaction with service quality.",
  "nps_score": 10,
  "overall_feedback": "Customer demonstrated strong loyalty due to consistently positive experiences with speed and fair pricing.",
  "positive_mentions": ["loyalty", "timeliness", "pricing", "satisfaction"],
  "detractors": []
}}
```

### Example J:

**Transcript:**
Customer: "The online booking system was confusing and when I arrived, they had no record of my appointment. The mechanic made up for it though."
**Tags:** `scheduling, online experience, customer service, professionalism`

**Output:**

```json
{{
  "call_summary": "Customer frustrated with booking system issues but appreciated mechanic's service.",
  "nps_score": 5,
  "overall_feedback": "Customer experienced scheduling problems that created initial disappointment, though service recovery somewhat mitigated the issue.",
  "positive_mentions": ["professionalism"],
  "detractors": ["scheduling", "online experience"]
}}
```

---

## --- JSON OUTPUT SCHEMA ---

Respond with a valid JSON object that follows this structure:

```json
{{
  "call_summary": "string (max 1 sentence)",
  "nps_score": integer or null,
  "overall_feedback": "string (1–2 lines)",
  "positive_mentions": ["list of tags"],
  "detractors": ["list of tags"]
}}
```

---

**Response Format:**
Format your analysis as valid JSON following the exact schema provided above.

"""


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
