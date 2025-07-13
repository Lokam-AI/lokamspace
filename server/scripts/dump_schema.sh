#!/bin/bash

# Script to dump the PostgreSQL database schema
# This script dumps the database schema without data, ownership or access privileges

# Set variables
DB_HOST="localhost"
DB_PORT="5433"
DB_USER="autopulse"
DB_NAME="autopulse"
OUTPUT_DIR="$(dirname "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)")/scripts"
SCHEMA_FILE="${OUTPUT_DIR}/autopulse_schema.sql"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${OUTPUT_DIR}/autopulse_schema_${TIMESTAMP}.sql"

# Print script header
echo "==================================================="
echo "AutoPulse Database Schema Dump Script"
echo "==================================================="
echo "Database: ${DB_NAME}"
echo "Host: ${DB_HOST}:${DB_PORT}"
echo "User: ${DB_USER}"
echo "Output: ${SCHEMA_FILE}"
echo "==================================================="

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo "Error: pg_dump command not found. Please ensure PostgreSQL client tools are installed."
    exit 1
fi

# Backup existing schema file if it exists
if [ -f "$SCHEMA_FILE" ]; then
    echo "Backing up existing schema file to ${BACKUP_FILE}"
    cp "$SCHEMA_FILE" "$BACKUP_FILE"
fi

# Dump the schema
echo "Dumping database schema..."
pg_dump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --schema-only \
  --no-owner \
  --no-acl \
  "$DB_NAME" \
  > "$SCHEMA_FILE"

# Check if dump was successful
if [ $? -eq 0 ]; then
    echo "Schema dump completed successfully!"
    echo "Schema saved to: ${SCHEMA_FILE}"
    
    # Count tables, views, and functions
    TABLES=$(grep -c "CREATE TABLE" "$SCHEMA_FILE")
    VIEWS=$(grep -c "CREATE VIEW" "$SCHEMA_FILE")
    FUNCTIONS=$(grep -c "CREATE FUNCTION" "$SCHEMA_FILE")
    
    echo "==================================================="
    echo "Schema Summary:"
    echo "Tables: ${TABLES}"
    echo "Views: ${VIEWS}"
    echo "Functions: ${FUNCTIONS}"
    echo "==================================================="
else
    echo "Error: Schema dump failed!"
    
    # Restore backup if it exists
    if [ -f "$BACKUP_FILE" ]; then
        echo "Restoring previous schema file..."
        cp "$BACKUP_FILE" "$SCHEMA_FILE"
    fi
    
    exit 1
fi

echo "Done!" 