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
assistant: "Hi there. Hope you're doing well. This is Luke from Garage 25. Now a good time to talk?"
human: "Yep. Good time to talk."
assistant: "Great. I just wanted to check-in and see how your recent oil change service experience was for you."
human: "It was good. Thanks for asking."
assistant: "Thanks for sharing that. Always nice to hear. Just 1 last question. On a scale of 0 to 10, 0 is not at all likely and 10 is extremely likely, how likely are you to recommend garage 25 to a friend or colleague?"
human: "9."
**Tags:** `Improve Advisor Communication, Enhance Customer Experience, Reduce Wait Time, Increase Service Transparency`

**Output:**

```json
{{
  "call_summary": "Customer had a positive experience with the oil change service and gave a high recommendation score.",
  "nps_score": 9,
  "overall_feedback": "Customer was satisfied with the service and willing to recommend to others, indicating efficient service delivery.",
  "positive_mentions": ["Enhance Customer Experience", "Reduce Wait Time"],
  "detractors": ["Increase Service Transparency"]
}}
```

### Example B:

**Transcript:**
assistant: "Awesome. I just wanted to quickly check-in on your recent oil change with us. How was the overall service experience for you?"
human: "It was alright. You could have improved the timing."
assistant: "Thanks for sharing that. I appreciate your honesty. Just to understand how you feel overall. On a scale of 0 to 10, 0 is not at all likely, and 10 is extremely likely, likely are you to recommend Garage 25 to a friend or colleague?"
human: "I'll give you the 8."
human: "Time. Time. Timing."
**Tags:** `Reduce Wait Time, Improve Advisor Communication, Enhance Customer Experience`

**Output:**

```json
{{
  "call_summary": "Customer reported adequate service but highlighted timing issues with the oil change.",
  "nps_score": 8,
  "overall_feedback": "Customer felt the service was good overall but was dissatisfied with the wait time and emphasized this concern repeatedly.",
  "positive_mentions": ["Enhance Customer Experience", "Improve Advisor Communication"],
  "detractors": ["Reduce Wait Time"]
}}
```

### Example C:

**Transcript:**
assistant: "Great. Thanks. I'm just following up quickly about recent oil change service. Was the entire service experience for you?"
human: "It's good. Thanks for asking."
assistant: "Thanks for sharing that. Always nice to hear. Just 1 last question. On a scale of 0 to 10, where 0 is not at all likely, and 10 is extremely likely, likely are you to recommend garage 25 to a friend or colleague?"
human: "7?"
assistant: "Got it. A 7. Appreciate that. What do you think could have improved your experience to push that score closer to a 10?"
human: "Maybe you can have you know, better communication because it was not communicated very well with me when to come and when to go."
**Tags:** `Improve Advisor Communication, Enhance Customer Experience, Streamline Booking Process`

**Output:**

```json
{{
  "call_summary": "Customer was satisfied with service but identified communication issues regarding timing.",
  "nps_score": 7,
  "overall_feedback": "Customer had a generally positive experience but expressed frustration about unclear communication regarding appointment scheduling and workflow.",
  "positive_mentions": ["Enhance Customer Experience"],
  "detractors": ["Improve Advisor Communication", "Streamline Booking Process"]
}}
```

### Example D:

**Transcript:**
assistant: "I was referring to the engine diagnosis service you recently had at garage 25. Just wanted to know how your experience was."
human: "It was okay. Nothing too great. Nothing too bad."
assistant: "Appreciate that. And just to get a clearer picture, on a scale of 0 to 10, where 0 is not at all likely, and 10 is extremely likely, how likely are you to recommend garage"
human: "It's nothing too great, nothing too bad."
**Tags:** `Enhance Customer Experience, Increase Service Transparency`

**Output:**

```json
{{
  "call_summary": "Customer felt the engine diagnosis service was average.",
  "nps_score": 5,
  "overall_feedback": "Customer expressed neutral sentiment about the service, indicating neither satisfaction nor dissatisfaction with the diagnostic quality or process.",
  "positive_mentions": [],
  "detractors": ["Enhance Customer Experience", "Increase Service Transparency"]
}}
```

### Example E:

**Transcript:**
assistant: "Great. Just wanted to check was the entire service experience for you at Garage 25?"
human: "Less Okeesh."
assistant: "Thank you for being honest. Could you share a bit more about what made the experience less okay? Was it related to timeliness, pricing, quality of work, communication, or or or something else?"
human: "The pricing as well as the bulk of your work."
assistant: "I appreciate your feedback. To get a clearer picture, a scale of 0 to 10, where 0 is not at all likely, and 10 is extremely likely."
human: "I'll do it at 3."
**Tags:** `Increase Service Transparency, Enhance Customer Experience, Improve Advisor Communication`

**Output:**

```json
{{
  "call_summary": "Customer was dissatisfied with both pricing and quality of work.",
  "nps_score": 3,
  "overall_feedback": "Customer expressed significant concerns about value for money and workmanship quality, indicating a negative service experience.",
  "positive_mentions": [],
  "detractors": ["Increase Service Transparency", "Enhance Customer Experience", "Improve Advisor Communication"]
}}
```

### Example F:

**Transcript:**
assistant: "Great. I just wanted to check how was the entire service experience for you?"
human: "You mean the service experience that I had, I your service station that is?"
assistant: "Exactly. I'm referring to the service experience at our station for your recent oil change. How did everything go for you?"
human: "It went very well."
assistant: "So nice to hear. Thanks for sharing that. Just 1 last question. On a scale of 0 to 10, where 0 is not at all likely, and 10 is extremely likely, how likely are you to recommend Garage 25 to a friend or colleague"
human: "Maybe a 9"
assistant: "Thanks so much for that. Glad to know you had a great experience. Could you tell me what stood out for you? Was it efficiency? Friendliness, satisfaction, or something else?"
human: "The timeliness I got the car right on time, so the timeliness."
**Tags:** `Reduce Wait Time, Enhance Customer Experience, Streamline Booking Process`

**Output:**

```json
{{
  "call_summary": "Customer had an excellent experience with emphasis on timely service completion.",
  "nps_score": 9,
  "overall_feedback": "Customer was very satisfied with the service, particularly highlighting the punctual delivery of the vehicle which exceeded expectations.",
  "positive_mentions": ["Reduce Wait Time", "Enhance Customer Experience"],
  "detractors": ["Streamline Booking Process"]
}}
```

### Example G:

**Transcript:**
assistant: "Great. Just wanted to check how was the entire service experience for you?"
human: "It was okay."
assistant: "Appreciate that. And just to get a clearer picture, a scale of 0 to 10, where 0 is not at all likely and 10 is extremely likely, how likely are you to recommend garage 25 to a friend or colleague?"
human: "6"
assistant: "Thanks for being honest. Can you share what went wrong? Or what could have been better? Like, timeliness, pricing transparency, quality of work, staff professionalism,"
**Tags:** `Enhance Customer Experience, Increase Service Transparency, Reduce Wait Time`

**Output:**

```json
{{
  "call_summary": "Customer found the service experience to be mediocre.",
  "nps_score": 6,
  "overall_feedback": "Customer expressed moderate satisfaction but indicated room for improvement in the overall service experience.",
  "positive_mentions": [],
  "detractors": ["Enhance Customer Experience", "Increase Service Transparency", "Reduce Wait Time"]
}}
```

### Example H:

**Transcript:**
assistant: "great. Just wanted to check how was the entire service experience for you?"
human: "Oh, it was amazing. The staff was on Boeing."
assistant: "That's fantastic to hear. Thanks for sharing that."
human: "Yeah."
assistant: "Always nice to hear. Just 1 last question. On a scale of 0 to 10, where 0 got it. Thank you for your feedback."
human: "7."
assistant: "What could have made your experience a 10?"
human: "Timeliness, maybe some customer experience, and pricing."
**Tags:** `Reduce Wait Time, Enhance Customer Experience, Increase Service Transparency, Improve Advisor Communication`

**Output:**

```json
{{
  "call_summary": "Customer praised staff but identified three areas for service improvement.",
  "nps_score": 7,
  "overall_feedback": "Customer appreciated the staff interaction but felt improvements were needed in timeliness, overall experience, and pricing transparency.",
  "positive_mentions": ["Improve Advisor Communication"],
  "detractors": ["Reduce Wait Time", "Enhance Customer Experience", "Increase Service Transparency"]
}}
```

### Example I:

**Transcript:**
assistant: "Thank you. I'm calling to get your feedback on your recent oil change service with us. Just wanted to check how was the entire service experience for you?"
human: "Be honest, I'm really like, I have doubts that did you really change the oil?"
assistant: "Really sorry to hear that you're feeling this way. Can you tell me what specifically led you to to doubt it? Was there any particular issue or concern?"
human: "I'm not seeing any improvements in the driving experience. I'm still seeing some, I know, grinding noise from the engine. I have issue."
assistant: "Thank you for sharing that. I understand how concerning that must be,"
assistant: "especially after an oil change. That grinding noise"
assistant: "isn't what you'd expect. On a scale of 0 to 10, how likely are you to recommend garage 25 to a friend or colleague considering this experience?"
human: "I recommend it. I will give it a 2 or a 1."
**Tags:** `Increase Service Transparency, Enhance Customer Experience, Improve Advisor Communication`

**Output:**

```json
{{
  "call_summary": "Customer expressed serious doubts about service completion due to persistent engine noise.",
  "nps_score": 1,
  "overall_feedback": "Customer was highly dissatisfied and suspicious that the oil change wasn't properly performed due to continued driving issues and lack of explanation.",
  "positive_mentions": [],
  "detractors": ["Increase Service Transparency", "Enhance Customer Experience", "Improve Advisor Communication"]
}}
```

### Example J:

**Transcript:**
assistant: "Thanks. Great. Thank you. Just wanted to check. How was the entire service experience for you."
human: "Yeah. Quite good."
assistant: "That's wonderful to hear. Thank you for sharing that with me. Just 1 last question. On a scale of 0 to 10, where 0 is not at all likely and 10 is extremely likely, How likely are you to recommend garage 25 to a friend or colleague?"
human: "Say 8"
assistant: "Appreciate that, Richard. What could we have done to improve your score to a perfect 10?"
human: "Give me a cheaper price."
**Tags:** `Increase Service Transparency, Enhance Customer Experience, Improve Advisor Communication`

**Output:**

```json
{{
  "call_summary": "Customer had a positive experience but noted pricing concerns affected their recommendation score.",
  "nps_score": 8,
  "overall_feedback": "Customer was generally satisfied with the service but felt the pricing was too high, suggesting a need for better value or pricing transparency.",
  "positive_mentions": ["Enhance Customer Experience", "Improve Advisor Communication"],
  "detractors": ["Increase Service Transparency"]
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