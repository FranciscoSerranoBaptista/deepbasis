#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to print messages with timestamps
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

# Generate a random password
TEST_DB_PASSWORD=$(openssl rand -base64 16)

# Database configuration
DB_HOST="localhost"
DB_PORT=5432
DB_SUPERUSER="postgres"
TEST_DB_USER="deepdialogue_test_user"
TEST_DB="deepdialogue_test"

# Prompt for superuser password
read -sp "Enter PostgreSQL superuser ($DB_SUPERUSER) password: " PGPASSWORD
echo

# Function to run SQL commands
run_sql() {
  PGPASSWORD=$PGPASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_SUPERUSER" "$@"
}

# Create test user
log "Creating test database user..."
run_sql <<EOF
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$TEST_DB_USER') THEN
    CREATE USER $TEST_DB_USER WITH PASSWORD '$TEST_DB_PASSWORD';
  ELSE
    ALTER USER $TEST_DB_USER WITH PASSWORD '$TEST_DB_PASSWORD';
  END IF;
END
\$\$;
EOF

# Create .env.test file with the credentials
log "Creating .env.test file..."
cat > .env.test << EOF
DB_HOST=localhost
DB_PORT=5432
DB_USER=$TEST_DB_USER
DB_PASSWORD=$TEST_DB_PASSWORD
DB_NAME=$TEST_DB

# App configuration
NODE_ENV=test
LOG_LEVEL=error
EOF

log "Test user created successfully!"
log "Credentials have been saved to .env.test"
log "Test Database User: $TEST_DB_USER"
log "Test Database Password: $TEST_DB_PASSWORD"
log ""
log "Please save these credentials securely!"
