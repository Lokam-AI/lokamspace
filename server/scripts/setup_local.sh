#!/bin/bash
# AutoPulse Local Development Setup Script
# This script sets up the complete development environment for AutoPulse

set -e  # Exit on error

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}AutoPulse Local Development Setup Script${NC}"
echo -e "${BLUE}=========================================${NC}"

# Check if Python 3.9+ is installed
echo -e "${YELLOW}Checking Python version...${NC}"
if command -v python3 &>/dev/null; then
    PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
    if (( $(echo "$PYTHON_VERSION < 3.9" | bc -l) )); then
        echo -e "${RED}Error: Python 3.9+ is required. You have Python $PYTHON_VERSION${NC}"
        exit 1
    else
        echo -e "${GREEN}Python $PYTHON_VERSION detected${NC}"
    fi
else
    echo -e "${RED}Error: Python 3 not found${NC}"
    exit 1
fi

# Check if Docker is installed
echo -e "${YELLOW}Checking Docker installation...${NC}"
if ! command -v docker &>/dev/null; then
    echo -e "${RED}Error: Docker not found. Please install Docker first.${NC}"
    exit 1
else
    echo -e "${GREEN}Docker is installed${NC}"
fi

# Check if Docker Compose is installed
echo -e "${YELLOW}Checking Docker Compose installation...${NC}"
if ! command -v docker-compose &>/dev/null; then
    echo -e "${RED}Error: Docker Compose not found. Please install Docker Compose first.${NC}"
    exit 1
else
    echo -e "${GREEN}Docker Compose is installed${NC}"
fi

# Create virtual environment if it doesn't exist
echo -e "${YELLOW}Setting up Python virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}Virtual environment created${NC}"
else
    echo -e "${GREEN}Virtual environment already exists${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install -r requirements.txt
echo -e "${GREEN}Dependencies installed${NC}"

# Create .env file from example if it doesn't exist
echo -e "${YELLOW}Setting up environment variables...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}Created .env file from template. Please update with your local settings.${NC}"
    else
        echo -e "${RED}Error: .env.example file not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}.env file already exists${NC}"
fi

# Start Docker services
echo -e "${YELLOW}Starting Docker services...${NC}"
docker-compose up -d db
echo -e "${GREEN}PostgreSQL database started${NC}"

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
sleep 5

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
alembic upgrade head
echo -e "${GREEN}Database migrations completed${NC}"

# Seed initial data
echo -e "${YELLOW}Seeding initial data...${NC}"
python scripts/seed_data.py
echo -e "${GREEN}Initial data seeded${NC}"

echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}Setup complete!${NC}"
echo -e "${GREEN}Run the following command to start the development server:${NC}"
echo -e "${YELLOW}uvicorn app.main:app --reload --host 0.0.0.0 --port 8000${NC}"
echo -e "${BLUE}=========================================${NC}" 