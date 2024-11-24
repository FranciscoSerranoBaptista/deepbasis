#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to print messages with timestamps
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

# Test database configuration
DB_NAME="deepdialogue_test"
DB_USER="deepdialogue_test_user"

# Function to run SQL commands using local connection
run_sql() {
  psql -U postgres "$@"
}

log "Checking for existing test database..."
if run_sql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    log "Dropping existing test database $DB_NAME"
    run_sql postgres <<EOF
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = '$DB_NAME';
        DROP DATABASE IF EXISTS $DB_NAME;
EOF
fi

log "Creating test database $DB_NAME"
run_sql postgres <<EOF
    CREATE DATABASE $DB_NAME;

    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
            CREATE USER $DB_USER;
        END IF;
    END
    \$\$;

    GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

log "Setting up schema permissions..."
run_sql "$DB_NAME" <<EOF
    GRANT ALL ON SCHEMA public TO $DB_USER;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO $DB_USER;
EOF

log "Test database initialization completed successfully"
