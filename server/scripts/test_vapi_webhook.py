#!/usr/bin/env python
"""
Test script for VAPI webhook integration.
This script sends mock webhook payloads to the webhook endpoint for testing.

Usage:
    python test_vapi_webhook.py [--endpoint URL] [--event TYPE]

Options:
    --endpoint URL  The webhook URL [default: http://localhost:8000/api/v1/webhooks/vapi-webhook]
    --event TYPE    The event type to send [default: status-update]
                    Valid types: status-update, end-of-call-report, hang
"""

import argparse
import json
import requests
import os

# Define mock payloads for different event types
STATUS_UPDATE_PAYLOAD = {
    "message": {
        "timestamp": 1752195615957,
        "type": "status-update",
        "status": "in-progress",
        "call": {
            "id": "6896cc2a-4989-48bd-8e24-d64dd2781d4b",
            "status": "in_progress",
            "assistantOverrides": {
                "variableValues": {
                    "call_id": "15",
                    "customer_name": "Test User",
                    "customer_phone": "+1234567890"
                }
            }
        }
    }
}

HANGUP_PAYLOAD = {
    "message": {
        "type": "hang",
        "reason": "user_initiated",
        "call": {
            "id": "6896cc2a-4989-48bd-8e24-d64dd2781d4b",
            "status": "ended",
            "assistantOverrides": {
                "variableValues": {
                    "call_id": "15"
                }
            }
        }
    }
}

END_CALL_REPORT_PAYLOAD = {
    "message": {
        "timestamp": 1752241157439,
        "type": "end-of-call-report",
        "startedAt": "2025-07-11T13:37:54.049Z",
        "endedAt": "2025-07-11T13:39:11.440Z",
        "endedReason": "assistant-ended-call",
        "cost": 0.1875,
        "durationMs": 77391,
        "durationSeconds": 77.391,
        "artifact": {
            "recordingUrl": "https://storage.vapi.ai/test-recording.wav",
            "messages": [
                {
                    "role": "assistant",
                    "message": "Hi, this is the assistant.",
                    "time": 1752241075149,
                    "endTime": 1752241076269,
                    "secondsFromStart": 1.12,
                    "duration": 1120
                },
                {
                    "role": "user",
                    "message": "Hello, this is the user.",
                    "time": 1752241082219,
                    "endTime": 1752241082539,
                    "secondsFromStart": 8.19,
                    "duration": 320
                }
            ]
        },
        "call": {
            "id": "b8d69c4d-b780-476b-8b4c-4da4b5a1a476",
            "assistantOverrides": {
                "variableValues": {
                    "call_id": "15"
                }
            }
        }
    }
}

def send_webhook(endpoint, event_type, api_key=None):
    """
    Send a webhook payload to the specified endpoint.
    
    Args:
        endpoint: The webhook URL
        event_type: The type of event to send
        api_key: The API key for authorization
        
    Returns:
        The response from the webhook endpoint
    """
    # Select the appropriate payload
    if event_type == "status-update":
        payload = STATUS_UPDATE_PAYLOAD
    elif event_type == "end-of-call-report":
        payload = END_CALL_REPORT_PAYLOAD
    elif event_type == "hang":
        payload = HANGUP_PAYLOAD
    else:
        raise ValueError(f"Invalid event type: {event_type}")
    
    # Prepare headers
    headers = {
        "Content-Type": "application/json"
    }
    
    if api_key:
        headers["X-Vapi-Signature"] = api_key
    
    # Send the request
    print(f"Sending {event_type} webhook to {endpoint}")
    print(f"Headers: {headers}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(endpoint, json=payload, headers=headers)
    
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    return response

if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Test VAPI webhook integration")
    parser.add_argument("--endpoint", default="http://localhost:8000/api/v1/webhooks/vapi-webhook", help="The webhook URL")
    parser.add_argument("--event", default="status-update", choices=["status-update", "end-of-call-report", "hang"], help="The event type to send")
    parser.add_argument("--api-key", default=None, help="The API key for authorization")
    args = parser.parse_args()
    
    # Use API key from environment variable if not provided
    api_key = args.api_key or os.environ.get("VAPI_WEBHOOK_SECRET")
    
    # Send the webhook
    send_webhook(args.endpoint, args.event, api_key) 