#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to print messages with timestamps
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

# Test database configuration
DB_NAME="deepdialogue_test"

# Function to run SQL commands using local connection
run_sql() {
  psql -U postgres "$@"
}

log "Terminating all connections to test database..."
run_sql postgres <<EOF
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = '$DB_NAME'
      AND pid <> pg_backend_pid();
EOF

log "Dropping test database..."
run_sql postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

log "Test database cleanup completed successfully"
