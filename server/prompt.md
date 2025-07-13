
## 🎧 After‑Call Analysis Task

You are an expert assistant. Analyze the following call transcript and output **exactly** the JSON described—no extra text, comments, or formatting. Be concise, factual, and adhere strictly to the schema.

### 📌 Input

**Call Transcript:**  
assistant: Hi, Ramesh. Are you still there?
human: Hi there.
assistant: Hi there. Hope you're doing well. This is Luke from Garage 25. Now a good time to talk?
human: Yes.
assistant: Great. Just a quick follow-up on
human: Go on.
assistant: thank
human: Hello?
assistant: Oh, sorry about that. I just wanted to check how was the entire service experience for you.
human: I'll give it a 10.
assistant: Thank you so much. Always nice to hear that. Just 1 last question. What stood out for you the most? Was it the efficiency, friendliness, satisfaction?
human: Nothing.
assistant: Got it. Thanks again for sharing.
human: Efficiency. Efficiency.
assistant: Efficiency. Love hearing that. Thanks again for sharing. Would it be okay if I text you a quick Google review link? Really helps us grow and means a lot to our team.
human: Sure. Why not?

**Service Record Info:**  
```json
{
  "customer_name": "Ramesh Kuttan",
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
