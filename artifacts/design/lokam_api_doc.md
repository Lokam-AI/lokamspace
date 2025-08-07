# Lokam API Documentation

## 🔐 Authentication

All API endpoints require authentication using an API Key provided by Lokam.

### Request Header

```http
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

---

## 🏢 Organization Management

### Get Organization Information

**Endpoint:** `/api/organization`  
**Method:** `GET`

**Response:**
```json
{
  "organization_name": "Garage 25",
  "organization_email": "garage25@example.com",
  "organization_location": "Los Angeles, CA, USA",
  "google_review_link": "https://g.page/garage25-review",
  "company_description": "Professional auto repair services.",
  "service_center_description": "Comprehensive automotive maintenance and repair.",
  "areas_to_focus": ["Customer Experience", "Service Transparency"],
  "service_types": ["Oil Change", "Brake Inspection"],
  "inquiry_topics": ["Service Booking", "Pricing Inquiry"]
}
```

---

### Update Organization Information

**Endpoint:** `/api/organization`  
**Method:** `PUT`

**Payload:**
```json
{
  "organization_name": "Garage 25",
  "organization_email": "garage25@example.com",
  "organization_location": "Los Angeles, CA, USA",
  "google_review_link": "https://g.page/garage25-review",
  "company_description": "Professional auto repair services.",
  "service_center_description": "Comprehensive automotive maintenance and repair.",
  "areas_to_focus": ["Customer Experience", "Service Transparency"],
  "service_types": ["Oil Change", "Brake Inspection"],
  "inquiry_topics": ["Service Booking", "Pricing Inquiry"]
}
```
**Response:**
```json
{
  "success": true,
  "message": "Organization updated successfully."
}
```

---

## 📞 Call Management

### Trigger Demo Call

**Endpoint:** `/api/calls/demo`  
**Method:** `POST`

**Payload:**
```json
{
  "customer_name": "John Doe",
  "customer_number": "+15551234567",
  "vehicle_number": "ABC-123",
  "service_type": "Oil Change",
  "service_advisor_name": "Mike Smith",
  "appointment_date": "2025-08-06T09:00:00Z"
}
```
**Response:**
```json
{
  "call_id": "call_001",
  "status": "initiated",
  "message": "Demo call triggered successfully."
}
```
*Webhook will return call analysis, status, and transcript.*

---

### Initiate Call by ID

**Endpoint:** `/api/calls/{call_id}/initiate`  
**Method:** `POST`

**Response:**
```json
{
  "success": true,
  "message": "Call initiated successfully.",
  "call_id": "call_001",
  "status": "initiated"
}
```

---

### Get Call Details by ID

**Endpoint:** `/api/calls/{call_id}`  
**Method:** `GET`

**Response:**
```json
{
  "call_id": "call_001",
  "campaign_name": "August Feedback",
  "appointment_date": "2025-08-06T09:00:00Z",
  "customer_name": "John Doe",
  "customer_number": "+15551234567",
  "vehicle_number": "ABC-123",
  "service_type": "Oil Change",
  "service_advisor_name": "Mike Smith",
  "status": "completed",
  "recordingUrl": "https://storage.url/audio.mp3",
  "startedAt": "2025-08-05T23:22:08.258Z",
  "endedAt": "2025-08-05T23:23:18.677Z",
  "endedReason": "assistant-ended-call",
  "cost": 0.1363,
  "analysis": {
    "summary": "Headline: The customer had a positive service experience ...",
    "structuredData": {
      "overall_feedback": "It was good.",
      "nps_score": 8,
      "nps_validated": true,
      "positives": ["The entire service experience was good"],
      "detractors": [],
      "action_items": []
    },
    "successEvaluation": "Good"
  },
  "messages": [
    {
      "role": "system",
      "message": "System instructions and configuration...",
      "time": 1754436128121,
      "secondsFromStart": 0
    },
    {
      "role": "bot",
      "message": "Hi, This is Luke from Garage 25. Calling regarding your recent service...",
      "time": 1754436129585,
      "endTime": 1754436140835.001,
      "secondsFromStart": 1.1999999,
      "duration": 10240.000732421875,
      "source": ""
    },
    {
      "role": "user",
      "message": "Yep.",
      "time": 1754436141925.001,
      "endTime": 1754436142245.001,
      "secondsFromStart": 13.540001,
      "duration": 320
    },
    {
      "role": "bot",
      "message": "Awesome. Just wanted to check. How was the entire service experience for you?",
      "time": 1754436143984.999,
      "endTime": 1754436147915,
      "secondsFromStart": 15.599999,
      "duration": 3600,
      "source": ""
    },
    {
      "role": "user",
      "message": "It was good.",
      "time": 1754436148905,
      "endTime": 1754436149625,
      "secondsFromStart": 20.52,
      "duration": 720
    },
    {
      "role": "bot",
      "message": "Thanks for sharing that. Always nice to hear. Just 1 last question...",
      "time": 1754436151045,
      "endTime": 1754436162714.998,
      "secondsFromStart": 22.66,
      "duration": 10559.998046875,
      "source": ""
    },
    {
      "role": "user",
      "message": "8",
      "time": 1754436163724.996,
      "endTime": 1754436164045,
      "secondsFromStart": 35.339996,
      "duration": 320.00390625
    },
    {
      "role": "bot",
      "message": "Appreciate that. What could have improved your experience to make it a perfect 10?",
      "time": 1754436166295,
      "endTime": 1754436170245,
      "secondsFromStart": 37.91,
      "duration": 3760,
      "source": ""
    },
    {
      "role": "user",
      "message": "No. Yeah.",
      "time": 1754436173495,
      "endTime": 1754436174055,
      "secondsFromStart": 45.11,
      "duration": 560
    },
    {
      "role": "bot",
      "message": "Thanks again for your time. I really appreciate your feedback. Have a wonderful day.",
      "time": 1754436176705,
      "endTime": 1754436192434.995,
      "secondsFromStart": 48.32,
      "duration": 4799.9951171875,
      "source": ""
    },
    {
      "role": "user",
      "message": "You're welcome.",
      "time": 1754436195275,
      "endTime": 1754436195995,
      "secondsFromStart": 66.89,
      "duration": 720
    },
    {
      "toolCalls": [
        {
          "id": "call_Vr2QP2oDkdNuD4Uezw0nlUHY",
          "type": "function",
          "function": {
            "name": "end_call_tool",
            "arguments": "{}"
          }
        }
      ],
      "role": "tool_calls",
      "message": "",
      "time": 1754436195469,
      "secondsFromStart": 67.211
    },
    {
      "role": "bot",
      "message": "Thank you so much. We wish to serve you better next time.",
      "time": 1754436196885,
      "endTime": 1754436199575,
      "secondsFromStart": 68.5,
      "duration": 2319.99609375,
      "source": ""
    },
    {
      "role": "tool_call_result",
      "time": 1754436198506,
      "secondsFromStart": 70.248,
      "name": "end_call_tool",
      "result": "Success.",
      "toolCallId": "call_Vr2QP2oDkdNuD4Uezw0nlUHY"
    }
  ]
}
```

---

### Cancel Scheduled Call

**Endpoint:** `/api/calls/{call_id}/cancel`  
**Method:** `POST`

**Response:**
```json
{
  "success": true,
  "message": "Call cancelled successfully."
}
```

---

## 📋 Call Listing & Reporting

### List All Calls

**Endpoint:** `/api/calls`  
**Method:** `GET`

**Response:**
```json
[
  {
    "call_id": "call_001",
    "campaign_name": "August Feedback",
    "appointment_date": "2025-08-06T09:00:00Z",
    "customer_name": "John Doe",
    "customer_number": "+15551234567",
    "vehicle_number": "ABC-123",
    "service_type": "Oil Change",
    "service_advisor_name": "Mike Smith",
    "status": "completed",
    "startedAt": "2025-08-05T23:22:08.258Z",
    "endedAt": "2025-08-05T23:23:18.677Z"
  }
]
```

---

### List Demo Calls

**Endpoint:** `/api/calls/demo`  
**Method:** `GET`

**Response:**
```json
[
  {
    "call_id": "call_001",
    "appointment_date": "2025-08-06T09:00:00Z",
    "customer_name": "John Doe",
    "customer_number": "+15551234567",
    "vehicle_number": "ABC-123",
    "service_type": "Oil Change",
    "service_advisor_name": "Mike Smith",
    "status": "completed"
  }
]
```

---

## 🎯 Campaign Management

### Create Campaign

**Endpoint:** `/api/campaigns`  
**Method:** `POST`

**Payload:**
```json
{
  "campaign_name": "August Customer Feedback"
}
```
**Response:**
```json
{
  "campaign_id": "123",
  "campaign_name": "August Customer Feedback",
  "success": true
}
```

---

### Retrieve Campaigns

**Endpoint:** `/api/campaigns`  
**Method:** `GET`

**Response:**
```json
[
  { "campaign_id": "123", "campaign_name": "August Feedback" },
  { "campaign_id": "124", "campaign_name": "September Feedback" }
]
```

---

### List Calls per Campaign

**Endpoint:** `/api/campaigns/{campaign_id}/calls`  
**Method:** `GET`

**Response:**
```json
[
  {
    "call_id": "call_002",
    "campaign_name": "August Feedback",
    "appointment_date": "2025-08-15T11:00:00Z",
    "customer_name": "Jane Doe",
    "customer_number": "+15557654321",
    "vehicle_number": "XYZ-789",
    "service_type": "Brake Inspection",
    "service_advisor_name": "Mike Smith",
    "status": "completed"
  }
]
```

---

### Add Calls to Campaign

**Endpoint:** `/api/campaigns/{campaign_id}/calls`  
**Method:** `POST`

**Payload:**
```json
{
  "calls": [
    {
      "customer_name": "Jane Doe",
      "customer_number": "+15557654321",
      "vehicle_number": "XYZ-789",
      "service_type": "Brake Inspection",
      "service_advisor_name": "Mike Smith",
      "appointment_date": "2025-08-15T11:00:00Z"
    }
  ]
}
```
**Response:**
```json
{
  "success": true,
  "added": 1,
  "message": "Calls added to campaign and marked as ready."
}
```

---

## 🕒 Call Scheduling

### Get Schedule Configuration

**Endpoint:** `/api/calls/schedule`  
**Method:** `GET`

**Response:**
```json
{
  "enabled": true,
  "active_days": ["Mon", "Wed", "Fri"],
  "time_slots": {
    "start_time": "09:00",
    "end_time": "17:00"
  }
}
```

---

### Update Schedule Configuration

**Endpoint:** `/api/calls/schedule`  
**Method:** `PUT`

**Payload:**
```json
{
  "enabled": true,
  "active_days": ["Mon", "Wed", "Fri"],
  "time_slots": {
    "start_time": "09:00",
    "end_time": "17:00"
  }
}
```
**Response:**
```json
{
  "success": true,
  "message": "Call schedule updated successfully."
}
```

---

## 📊 Analytics & Metrics

### Retrieve Call Metrics

**Endpoint:** `/api/metrics/calls`  
**Method:** `GET`

**Query Parameters:**  
- `start_date`: `YYYY-MM-DD`  
- `end_date`: `YYYY-MM-DD`

**Response:**
```json
{
  "total_calls": 100,
  "completed_calls": 95,
  "detractors": 5,
  "average_nps": 8.5,
  "cost_details": {
    "total_cost": "$150",
    "average_cost_per_call": "$1.50"
  }
}
```

---

## 🌐 Webhook Integration

### Configure Webhook

Webhook URL is configured through Lokam's platform during API Key creation.

### Webhook Events

#### Call Status Update

```json
{
  "call_id": "abc123",
  "status": "in-progress | completed | failed"
}
```

#### End-of-Call Report

```json
{
  "call_id": "abc123",
  "transcript": "Full transcript of the call.",
  "nps_score": 9,
  "areas_to_improve": ["Wait time", "Advisor communication"],
  "comments": "Customer was satisfied overall but indicated wait times could improve.",
  "analysis": {
    "summary": "...",
    "structuredData": {
      "overall_feedback": "...",
      "nps_score": 8,
      "nps_validated": true,
      "positives": ["..."],
      "detractors": [],
      "action_items": []
    },
    "successEvaluation": "Good"
  },
  "recordingUrl": "<url_here>",
  "startedAt": "2025-08-05T23:22:08.258Z",
  "endedAt": "2025-08-05T23:23:18.677Z",
  "endedReason": "assistant-ended-call",
  "cost": 0.1363
}
```

#### CRM Ticket / Escalation for Negative Reviews

```json
{
  "call_id": "abc123",
  "issue_type": "negative_review",
  "details": "Customer provided negative feedback requiring follow-up."
}
```

---

*This documentation serves as a complete reference for Lokam's APIs designed for automated feedback call management and customer satisfaction analysis.*
