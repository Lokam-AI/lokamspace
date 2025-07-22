
## 🎧 After‑Call Analysis Task

You are an expert assistant. Analyze the following call transcript and output **exactly** the JSON described—no extra text, comments, or formatting. Be concise, factual, and adhere strictly to the schema.

### 📌 Input

**Call Transcript:**  
assistant: Hi, Ralph.
human: How are you?
assistant: I'm doing great. Thanks for asking. Hope you're doing well too. This is Luke.
human: Okay.
assistant: This is Luke from Garage 25. Is now a good time to talk?
human: Yep.
assistant: Great. I just wanted to check how was the oil change service experience for you.
human: Done that.
assistant: Awesome. Sounds like you got it taken care of. How was the overall experience with us?
human: Well, I guess it was okay.
assistant: Thanks for sharing. I appreciate your honesty. Just to get a clearer picture, on a scale of 0 to 10, how likely are you to recommend garage 25 to a friend or colleague?
human: 9.
assistant: Thanks for sharing that. Always nice to hear. What specifically stood out to you about our service?
human: The receptionist, their way of handling the customers and the pricing was also nice.
assistant: Thank you for that great feedback. Would it be okay if I text you a quick Google review link? Leaving a review really helps us grow.
human: I'm sorry. No.
assistant: No worries at all. Thanks again for your time. I really appreciate your feedback. Have a wonderful day.

**Service Record Info:**  
```json
{
  "customer_name": "Raoof Naushad",
  "service_type": "Oil Change",
  "vehicle_info": "ABC-123",
  "service_advisor_name": "John Smith"
}
```

## Organization Info:
```json
{
  "company": "Lokam",
  "description": "We are a customer-first automobile service company committed to delivering fast, transparent, and high-quality service experiences for every vehicle owner.",
  "service_center": "Our service center specializes in diagnostics, repairs, and preventive maintenance, equipped with certified technicians and state-of-the-art tools.",
  "focus_tags": "Reduce Wait Time, Improve Advisor Communication, Increase Service Transparency, Enhance Customer Experience, Streamline Booking Process, Pricing Transparency",
  "location": "New York, NY, USA"
}
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

```json
{
  "call_summary": "<string>",
  "nps_score": <integer|null>,
  "overall_feedback": "<string>",
  "positive_mentions": ["<tag1>", "..."],
  "detractors": ["<tag2>", "..."]
}
```

Respond with valid JSON exactly matching the schema.
