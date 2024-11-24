#!/bin/bash

# scripts/migrate.sh

# Exit immediately if a command exits with a non-zero status
set -e

# Function to print messages with timestamps
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  log "Loading environment variables from .env file"
  export $(grep -v '^#' .env | xargs)
fi

# Run database migrations
log "Applying database migrations..."

# Using TypeORM CLI with ts-node
npx typeorm migration:run

log "Database migrations applied successfully."
