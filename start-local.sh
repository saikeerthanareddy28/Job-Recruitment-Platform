#!/bin/bash
# ============================================================
# JobPortal Local Development Startup Script
# Starts MySQL via Docker, then guides you to start backend + frontend
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}     JobPortal - Local Dev Startup Script       ${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Check required tools
check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo -e "${RED}ERROR: '$1' is not installed or not in PATH${NC}"
    echo "Please install $1 and try again."
    exit 1
  fi
}

echo "Checking required tools..."
check_command docker
check_command java
check_command mvn
check_command node
check_command npm
echo -e "${GREEN}All required tools found!${NC}"
echo ""

# Check Java version
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 21 ] 2>/dev/null; then
  echo -e "${RED}ERROR: Java 21+ is required. Current version: $JAVA_VERSION${NC}"
  exit 1
fi
echo -e "${GREEN}Java version: OK (v$JAVA_VERSION)${NC}"

# Load .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "${GREEN}.env loaded${NC}"
else
  echo -e "${YELLOW}WARNING: No .env file found. Using defaults.${NC}"
fi

# Start MySQL with Docker
echo ""
echo -e "${YELLOW}Starting MySQL database...${NC}"
docker compose up mysql -d

echo ""
echo -e "${YELLOW}Waiting for MySQL to be ready (this may take 30-60 seconds)...${NC}"
RETRIES=30
until docker exec jobportal-mysql mysqladmin ping -h localhost -u root -p"${DB_ROOT_PASSWORD:-rootpassword123}" --silent 2>/dev/null; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -eq 0 ]; then
    echo -e "${RED}ERROR: MySQL did not start in time.${NC}"
    echo "Try: docker logs jobportal-mysql"
    exit 1
  fi
  printf "."
  sleep 2
done
echo ""
echo -e "${GREEN}MySQL is ready!${NC}"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Database is running! Now open 2 more terminals:${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${YELLOW}TERMINAL 2 - Start Backend:${NC}"
echo "  cd backend"
echo "  export DB_HOST=localhost"
echo "  export DB_PORT=3306"
echo "  export DB_NAME=${DB_NAME:-jobportal}"
echo "  export DB_USERNAME=${DB_USERNAME:-root}"
echo "  export DB_PASSWORD=${DB_ROOT_PASSWORD:-rootpassword123}"
echo "  export JWT_SECRET=${JWT_SECRET:-JobPortalSecretKey2024_ChangeInProduction_XYZ789}"
echo "  export JPA_DDL_AUTO=validate"
echo "  mvn spring-boot:run"
echo ""
echo -e "${YELLOW}TERMINAL 3 - Start Frontend:${NC}"
echo "  cd frontend"
echo "  npm install"
echo "  npm run dev"
echo ""
echo -e "${GREEN}Then open: http://localhost:3000${NC}"
echo -e "${GREEN}Admin login: admin@jobportal.com / Admin@123456${NC}"
echo ""
