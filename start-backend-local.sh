#!/bin/bash
# Run this in Terminal 2 after MySQL is up via start-local.sh

set -a
source "$(dirname "$0")/.env"
set +a

echo "Starting backend with DB_HOST=localhost..."
cd "$(dirname "$0")/backend"
export DB_USERNAME="${DB_USERNAME:-root}"
export DB_PASSWORD="${DB_ROOT_PASSWORD:-rootpassword123}"
export JPA_DDL_AUTO=validate
mvn spring-boot:run
