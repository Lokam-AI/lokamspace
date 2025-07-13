#!/bin/bash
# Script to fix inconsistencies between SQLAlchemy models and Alembic migrations

set -e  # Exit on error

# Check if we're in the server directory
if [ ! -f "./app/main.py" ]; then
    echo "Error: Please run this script from the server directory"
    exit 1
fi

# Display warning
echo "WARNING: This script will make changes to your database schema."
echo "Make sure you have a backup before proceeding."
echo ""
read -p "Do you want to create a database backup first? (y/n): " CREATE_BACKUP

# Create backup if requested
if [[ "$CREATE_BACKUP" =~ ^[Yy]$ ]]; then
    echo "Creating database backup..."
    
    # Get database connection details from environment or config
    # You may need to customize this depending on your setup
    source ./.env 2>/dev/null || true
    
    DB_NAME="${POSTGRES_DB:-autopulse}"
    DB_USER="${POSTGRES_USER:-postgres}"
    
    BACKUP_FILE="autopulse_backup_$(date +%Y%m%d_%H%M%S).dump"
    
    # Create backup
    if pg_dump -Fc -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"; then
        echo "Backup created: $BACKUP_FILE"
    else
        echo "Error creating backup. Aborting."
        exit 1
    fi
fi

# Update models to use explicit table names
echo "Would you like to update models to use explicit table names? (y/n): "
read UPDATE_MODELS

if [[ "$UPDATE_MODELS" =~ ^[Yy]$ ]]; then
    echo "Updating model files..."
    
    # Call model
    if grep -q "__tablename__" ./app/models/call.py; then
        echo "Call model already has tablename defined."
    else
        sed -i '' 's/class Call(Base):/class Call(Base):\n    """\n    Call model for tracking customer phone calls.\n    """\n    \n    # Table name\n    __tablename__ = "calls"/g' ./app/models/call.py
    fi
    
    # Transcript model
    if grep -q "__tablename__" ./app/models/transcript.py; then
        echo "Transcript model already has tablename defined."
    else
        sed -i '' 's/class Transcript(Base):/class Transcript(Base):\n    """\n    Transcript model for storing call transcript segments.\n    """\n    \n    # Table name\n    __tablename__ = "transcripts"/g' ./app/models/transcript.py
    fi
    
    # AudioFile model
    if grep -q "__tablename__" ./app/models/audio_file.py; then
        echo "AudioFile model already has tablename defined."
    else
        sed -i '' 's/class AudioFile(Base):/class AudioFile(Base):\n    """\n    AudioFile model for storing call audio files.\n    """\n    \n    # Table name\n    __tablename__ = "audio_files"/g' ./app/models/audio_file.py
    fi
    
    # Add other models as needed
    echo "Model files updated."
fi

# Create Alembic revision to fix inconsistencies
echo ""
echo "Creating Alembic revision to fix inconsistencies..."
alembic revision --autogenerate -m "fix_model_table_inconsistencies"

# Remind user to check generated migration
echo ""
echo "A new migration has been created to fix inconsistencies."
echo "IMPORTANT: Review the generated migration file carefully before applying it!"
echo "You may need to manually adjust the migration to handle certain edge cases."
echo ""
echo "Once you've reviewed the migration, you can apply it with:"
echo "  alembic upgrade head" 