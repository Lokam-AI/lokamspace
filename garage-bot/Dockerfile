# Use Python 3.12 slim as base image for better compatibility with dependencies
FROM python:3.12-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    portaudio19-dev \
    python3-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Download required models
RUN python agent.py download-files

# Set default environment variables (can be overridden at runtime)
ENV LIVEKIT_URL="" \
    LIVEKIT_API_KEY="" \
    LIVEKIT_API_SECRET="" \
    SIP_OUTBOUND_TRUNK_ID="" \
    DATABASE_URL="" \
    OPENAI_API_KEY="" \
    ELEVEN_API_KEY="" \
    DEEPGRAM_API_KEY="" \
    CARTESIA_API_KEY="" \
    MODEL_NAME="gpt-4-mini"

# Run the agent in dev mode
CMD ["python", "agent.py", "dev"]
