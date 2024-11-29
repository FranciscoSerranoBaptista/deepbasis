// scripts/setup-test-db.sh
#!/bin/bash

set -e

# Load environment variables from test.env
if [ -f "src/__tests__/config/test.env" ]; then
    export $(cat src/__tests__/config/test.env | grep -v '^#' | xargs)
fi

# Database configuration
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-5432}
TEST_DB_NAME=${TEST_DB_NAME:-"deepdialogue_test"}
TEST_DB_USER=${TEST_DB_USER:-"deepdialogue_test_user"}
TEST_DB_PASSWORD=${TEST_DB_PASSWORD:-"test_password"}

# Ask for postgres superuser password once
read -sp "Enter PostgreSQL superuser (postgres) password: " POSTGRES_PASSWORD
echo

# Function to run psql commands
function run_psql() {
    PGPASSWORD=${POSTGRES_PASSWORD} psql -h "$DB_HOST" -p "$DB_PORT" -U postgres "$@"
}

echo "Setting up test database..."

# Create test user if it doesn't exist
run_psql <<EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$TEST_DB_USER') THEN
        CREATE USER $TEST_DB_USER WITH PASSWORD '$TEST_DB_PASSWORD';
    END IF;
END \$\$;

DROP DATABASE IF EXISTS $TEST_DB_NAME;
CREATE DATABASE $TEST_DB_NAME OWNER $TEST_DB_USER;
EOF

# Grant privileges (connect to the specific database)
run_psql -d "$TEST_DB_NAME" <<EOF
GRANT ALL PRIVILEGES ON DATABASE $TEST_DB_NAME TO $TEST_DB_USER;
GRANT ALL PRIVILEGES ON SCHEMA public TO $TEST_DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $TEST_DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $TEST_DB_USER;
EOF

echo "Test database setup completed successfully!"
