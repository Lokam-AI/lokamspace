#!/bin/bash
# Script to completely reset Alembic migrations and database schema

set -e  # Exit on error

# Check if we're in the server directory
if [ ! -f "./app/main.py" ]; then
    echo "Error: Please run this script from the server directory"
    exit 1
fi

# Display warning
echo "WARNING: This script will DELETE ALL MIGRATIONS and DROP ALL TABLES in your database."
echo "ALL DATA WILL BE LOST. This cannot be undone."
echo ""
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Operation canceled."
    exit 0
fi

# Backup database if requested
read -p "Create a database backup before proceeding? (y/n): " CREATE_BACKUP

if [[ "$CREATE_BACKUP" =~ ^[Yy]$ ]]; then
    echo "Creating database backup..."
    
    # Get database connection details
    source ./.env 2>/dev/null || true
    
    DB_NAME="${POSTGRES_DB:-autopulse}"
    DB_USER="${POSTGRES_USER:-autopulse}"
    DB_PORT="${POSTGRES_PORT:-5433}"
    
    BACKUP_FILE="../db_backup_before_reset_$(date +%Y%m%d_%H%M%S).dump"
    
    if pg_dump -Fc -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"; then
        echo "Backup created: $BACKUP_FILE"
    else
        echo "Error creating backup. Aborting."
        exit 1
    fi
fi

# Check if all models have explicit __tablename__ attributes
echo "Checking if all models have explicit table names..."
MODELS_DIR="./app/models"
MODEL_FILES=$(ls $MODELS_DIR/*.py | grep -v "__init__.py" | grep -v "base.py")

MISSING_TABLENAMES=0
for model in $MODEL_FILES; do
    if ! grep -q "__tablename__" "$model"; then
        echo "Warning: $model does not have an explicit __tablename__ attribute"
        MISSING_TABLENAMES=$((MISSING_TABLENAMES+1))
    fi
done

if [ $MISSING_TABLENAMES -gt 0 ]; then
    echo "$MISSING_TABLENAMES model(s) are missing __tablename__ attributes."
    read -p "Continue anyway? (y/n): " CONTINUE
    
    if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
        echo "Please add explicit __tablename__ attributes to all models before continuing."
        exit 1
    fi
fi

# Delete existing migration versions
echo "Deleting existing migration versions..."
rm -f ./alembic/versions/*.py

# Create a marker file so we remember this was reset
touch ./alembic/versions/README.md
echo "# Migration History" > ./alembic/versions/README.md
echo "Migration history was reset on $(date)" >> ./alembic/versions/README.md

# Reset database
echo "Resetting database schema..."
read -p "Enter database name (default: autopulse): " DB_NAME
DB_NAME=${DB_NAME:-autopulse}

read -p "Enter database user (default: autopulse): " DB_USER
DB_USER=${DB_USER:-autopulse}

read -p "Enter database port (default: 5433): " DB_PORT
DB_PORT=${DB_PORT:-5433}

read -p "Enter database host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

# Check if PostgreSQL is running on the specified port
echo "Checking PostgreSQL connection..."
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT"; then
    echo "Error: Could not connect to PostgreSQL at $DB_HOST:$DB_PORT"
    echo "Please check if PostgreSQL is running and the port is correct."
    exit 1
fi

# Set PGPASSWORD if not set
if [ -z "$PGPASSWORD" ]; then
    read -s -p "Enter PostgreSQL password for user $DB_USER: " PGPASSWORD
    echo
    export PGPASSWORD
fi

# Drop and recreate the database
echo "Dropping database $DB_NAME (if it exists)..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;" postgres

echo "Creating database $DB_NAME..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" postgres

# Create the uuid-ossp extension if it doesn't exist
echo "Creating uuid-ossp extension..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

echo "Database has been reset."

# Update alembic.ini with the correct database URL
echo "Updating alembic.ini with the correct database URL..."
SQLALCHEMY_URL="postgresql://$DB_USER:$PGPASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
sed -i.bak "s|^sqlalchemy.url = .*|sqlalchemy.url = $SQLALCHEMY_URL|" ./alembic.ini
echo "alembic.ini updated."

# Create new initial migration
echo "Creating new initial migration..."
echo "If this fails due to model issues, fix them and run 'alembic revision --autogenerate -m \"initial_schema\"' manually."
alembic revision --autogenerate -m "initial_schema" || echo "Failed to create migration. Please fix model errors and try again."

# Show next steps
echo ""
echo "============================================================="
echo "Reset completed! Next steps:"
echo ""
echo "1. Review the generated migration file in ./alembic/versions/"
echo "2. Apply the migration with: alembic upgrade head"
echo "3. Verify that the database schema matches your models"
echo "=============================================================" 