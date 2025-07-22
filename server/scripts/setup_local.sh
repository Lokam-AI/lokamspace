#!/bin/bash

# Navigate to the server directory
cd "$(dirname "$0")"

# Start only the db service
echo "Starting PostgreSQL service..."
docker-compose up -d db

# Create a virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate the virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

echo "Setup complete!"