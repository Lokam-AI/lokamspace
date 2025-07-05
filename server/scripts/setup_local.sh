#!/bin/bash

# AutoPulse Local Development Setup Script
# ---------------------------------------
# This script sets up the local development environment for AutoPulse backend,
# including virtual environment, dependencies, database, and migrations.

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Get the parent directory (project root)
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}==>${NC} ${YELLOW}$1${NC}\n"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error messages and exit
print_error() {
    echo -e "${RED}ERROR:${NC} $1"
    exit 1
}

# Clean up function
cleanup() {
    print_section "Cleaning up repository"
    
    # Remove Python cache files
    find . -type d -name "__pycache__" -exec rm -rf {} +
    find . -type f -name "*.pyc" -delete
    find . -type f -name "*.pyo" -delete
    find . -type f -name "*.pyd" -delete
    find . -type f -name ".DS_Store" -delete
    print_success "Removed Python cache files"
    
    # Clean alembic versions
    if [ -d "alembic/versions" ]; then
        rm -rf alembic/versions/*
        print_success "Cleaned alembic versions"
    fi
    
    # Remove virtual environment if --clean flag is passed
    if [ "$1" == "--clean" ]; then
        rm -rf venv
        print_success "Removed virtual environment"
    fi
}

# Check prerequisites
print_section "Checking prerequisites"

# Check Python version
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.9 or higher."
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)

if [[ $PYTHON_MAJOR -lt 3 || ($PYTHON_MAJOR -eq 3 && $PYTHON_MINOR -lt 9) ]]; then
    print_error "Python 3.9+ is required. Found: Python $PYTHON_VERSION"
else
    print_success "Python $PYTHON_VERSION detected"
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Warning:${NC} Docker is not installed. You'll need to set up PostgreSQL manually."
else
    print_success "Docker is installed"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Warning:${NC} Docker Compose is not installed. You'll need to set up services manually."
else
    print_success "Docker Compose is installed"
fi

# Clean up repository
cleanup $1

# Navigate to project root
cd "$PROJECT_ROOT"

# Create .env file if it doesn't exist
print_section "Setting up environment variables"

if [ ! -f .env ]; then
    echo "Creating .env file from defaults"
    cat > .env << EOL
# Database Configuration
# Using port 5433 to avoid conflicts with existing PostgreSQL installations
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=autopulse
POSTGRES_PASSWORD=autopulse
POSTGRES_DB=autopulse

# Application Settings
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=debug
PROJECT_NAME=AutoPulse
PROJECT_DESCRIPTION="Auto service center call management system"
PROJECT_VERSION=0.1.0
API_V1_STR=/api/v1

# Security
SECRET_KEY=dev_secret_key_replace_in_production
JWT_SECRET=dev_jwt_secret_replace_in_production
JWT_ALGORITHM=HS256
JWT_EXPIRATION=86400

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]

# Database settings
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_ECHO=false
CREATE_TABLES_ON_STARTUP=true
EOL

    print_success "Created .env file with default values"
else
    print_success ".env file already exists"
fi

# Create and activate virtual environment
print_section "Setting up Python virtual environment"

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_success "Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate
print_success "Virtual environment activated"

# Install dependencies
print_section "Installing dependencies"
pip install --upgrade pip
pip install -r requirements.txt
print_success "Dependencies installed"

# Start PostgreSQL using Docker Compose if Docker is available
if command -v docker-compose &> /dev/null; then
    print_section "Starting PostgreSQL with Docker"
    docker-compose up -d db
    
    # Wait for PostgreSQL to be ready
    echo "Waiting for PostgreSQL to be ready..."
    for i in {1..10}; do
        if docker-compose exec -T db pg_isready -U autopulse > /dev/null 2>&1; then
            print_success "PostgreSQL is ready"
            break
        fi
        echo "."
        sleep 2
        if [ $i -eq 10 ]; then
            print_error "PostgreSQL did not start properly"
        fi
    done

    # Initialize database
    print_section "Initializing database"
    
    # Terminate existing connections and recreate database
    echo "Resetting database..."
    docker-compose exec -T db psql -U autopulse -d postgres -c "
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'autopulse'
        AND pid <> pg_backend_pid();"
    docker-compose exec -T db psql -U autopulse -d postgres -c "DROP DATABASE IF EXISTS autopulse;"
    docker-compose exec -T db psql -U autopulse -d postgres -c "CREATE DATABASE autopulse;"
    print_success "Database reset complete"
    
    # Create UUID extension
    echo "Creating UUID extension..."
    docker-compose exec -T db psql -U autopulse -d autopulse -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
    print_success "UUID extension created"
    
else
    echo -e "${YELLOW}Note:${NC} Skipping Docker PostgreSQL setup. Make sure your database is properly configured."
fi

# Create initial migration
print_section "Setting up migrations"
echo "Creating initial migration..."
mkdir -p alembic/versions
alembic revision --autogenerate -m "initial schema with all models"
print_success "Initial migration created"

# Apply migrations
echo "Applying migrations..."
alembic upgrade head
print_success "Database migrations applied"

# Print completion message
print_section "Setup complete!"
echo -e "You can now start the server with:\n"
echo -e "  ${GREEN}source venv/bin/activate${NC}  # If not already activated"
echo -e "  ${GREEN}uvicorn app.main:app --reload --host 0.0.0.0 --port 8000${NC}"
echo -e "\nAPI documentation will be available at: ${GREEN}http://localhost:8000/docs${NC}"

# Optional: Add instructions for running the service with Docker
echo -e "\nAlternatively, you can run the full stack with Docker:"
echo -e "  ${GREEN}docker-compose up${NC}"

# Usage instructions
echo -e "\n${YELLOW}Usage:${NC}"
echo -e "  ${GREEN}./scripts/setup_local.sh${NC}         # Normal setup"
echo -e "  ${GREEN}./scripts/setup_local.sh --clean${NC} # Clean setup (removes venv)"

# Finish
echo -e "\n${GREEN}AutoPulse backend is ready for development!${NC}\n" 