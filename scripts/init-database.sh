#!/bin/bash

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

# Default values if not set in environment
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-"postgres"}
DB_PASSWORD=${DB_PASSWORD:-"postgres"}
DB_NAME=${DB_NAME:-"deepdialogue_db"}
APP_DB_USER=${APP_DB_USER:-"dbuser"}
APP_DB_PASS=${APP_DB_PASS:-"dbpassword"}

# Print the configuration
log "Database configuration:"
log "Host: $DB_HOST"
log "Port: $DB_PORT"
log "Database: $DB_NAME"
log "Admin user: $DB_USER"
log "Application user: $APP_DB_USER"

# Function to run SQL commands
run_sql() {
  PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$@"
}

# Check if PostgreSQL is accepting connections
log "Checking PostgreSQL connection..."
until run_sql -c '\q' > /dev/null 2>&1; do
  log "PostgreSQL is unavailable - sleeping for 1 second"
  sleep 1
done

# Create database if it doesn't exist
if run_sql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  log "Database $DB_NAME already exists"
else
  log "Creating database $DB_NAME"
  run_sql -c "CREATE DATABASE $DB_NAME;"
fi

# Connect to the database
log "Connecting to database $DB_NAME"

# Create application user if it doesn't exist
if run_sql -d "$DB_NAME" -tAc "SELECT 1 FROM pg_roles WHERE rolname='$APP_DB_USER'" | grep -q 1; then
  log "User $APP_DB_USER already exists"
else
  log "Creating user $APP_DB_USER"
  run_sql -d "$DB_NAME" -c "CREATE USER $APP_DB_USER WITH ENCRYPTED PASSWORD '$APP_DB_PASS';"
fi

# Grant privileges to application user
log "Granting privileges to $APP_DB_USER"
run_sql -d "$DB_NAME" <<EOF
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $APP_DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $APP_DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $APP_DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO $APP_DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO $APP_DB_USER;
EOF

log "Database initialization completed successfully"
