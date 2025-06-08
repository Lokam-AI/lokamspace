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
    OPENAI_API_KEY="" \
    DEEPGRAM_API_KEY="" \
    MODEL_NAME="gpt-4o-mini"

# Run the agent in development mode
CMD ["python", "agent.py", "dev"]
