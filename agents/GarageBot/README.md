# GarageBot Service

A cloud microservice for automated car service feedback collection using LiveKit, OpenAI, Deepgram, and Cartesia.

## Overview

GarageBot is a stateless API service that manages automated feedback collection calls for car service centers. It uses:
- LiveKit for real-time audio communication
- Deepgram for Speech-to-Text
- OpenAI GPT-4 for conversation understanding
- Cartesia for Text-to-Speech
- PostgreSQL for data storage

## Features

- Automated outbound calls to customers
- Natural conversation flow for feedback collection
- Real-time transcription and response generation
- Structured feedback storage
- Call metrics and analytics
- RESTful API interface

## Prerequisites

- Python 3.9+
- PostgreSQL
- LiveKit server
- API keys for:
  - LiveKit
  - OpenAI
  - Deepgram
  - Cartesia

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd GarageBot
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Initialize the database:
```bash
# Create database in PostgreSQL
createdb garagebot

# The tables will be created automatically when the service starts
```

## Running the Service

### Local Development
```bash
uvicorn src.api.app:app --reload
```

### Production (Docker)
```bash
docker build -t garagebot .
docker run -p 8000:8000 --env-file .env garagebot
```

## API Endpoints

### Start Feedback Call
```http
POST /feedback/start
Content-Type: application/json

{
    "phone_number": "+1234567890",
    "service_record_id": "service_123"
}
```

### Check Call Status
```http
GET /feedback/{session_id}/status
```

## Environment Variables

See `.env.example` for all required environment variables.

## Architecture

The service is composed of several components:
- `api/`: FastAPI application and endpoints
- `telephony/`: LiveKit SIP call management
- `agent/`: Conversation agent implementation
- `db/`: Database models and connection management
- `config/`: Configuration and settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[MIT License](LICENSE) 