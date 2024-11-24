#!/bin/bash

# scripts/start.sh

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

# Optionally, run database migrations
log "Running database migrations..."
npm run migrate

# Start the application
log "Starting the application..."
npm run start
