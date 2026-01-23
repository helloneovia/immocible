#!/bin/sh
# Safe database initialization script that finds prisma schema
# This script handles different directory structures

set -e

echo "========================================="
echo "Starting database initialization..."
echo "========================================="
echo "Current directory: $(pwd)"
echo "Working directory contents:"
ls -la . 2>&1 || true

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

# Try to find the prisma schema file
SCHEMA_PATH=""
PRISMA_DIR=""

# First, try the expected location
if [ -f "/app/prisma/schema.prisma" ]; then
  SCHEMA_PATH="/app/prisma/schema.prisma"
  PRISMA_DIR="/app/prisma"
  echo "Found schema at expected location: $SCHEMA_PATH"
elif [ -f "./prisma/schema.prisma" ]; then
  SCHEMA_PATH="./prisma/schema.prisma"
  PRISMA_DIR="./prisma"
  echo "Found schema in current directory: $SCHEMA_PATH"
else
  # Search for it
  echo "Searching for schema.prisma..."
  SCHEMA_PATH=$(find /app -name "schema.prisma" -type f 2>/dev/null | head -n 1)
  if [ -n "$SCHEMA_PATH" ]; then
    PRISMA_DIR=$(dirname "$SCHEMA_PATH")
    echo "Found schema at: $SCHEMA_PATH"
  fi
fi

if [ -z "$SCHEMA_PATH" ] || [ ! -f "$SCHEMA_PATH" ]; then
  echo "ERROR: Could not find schema.prisma file"
  echo "Searched locations:"
  echo "  - /app/prisma/schema.prisma"
  echo "  - ./prisma/schema.prisma"
  echo "Full search results:"
  find /app -type f -name "*.prisma" 2>/dev/null || echo "No .prisma files found"
  echo "Directory structure of /app:"
  ls -la /app/ 2>/dev/null || echo "Cannot list /app"
  echo "Current directory structure:"
  ls -la . 2>/dev/null || echo "Cannot list current directory"
  exit 1
fi

# Get the base directory (parent of prisma directory)
BASE_DIR=$(dirname "$PRISMA_DIR")
echo "Prisma directory: $PRISMA_DIR"
echo "Base directory: $BASE_DIR"

# Change to the base directory
cd "$BASE_DIR" || {
  echo "ERROR: Cannot change to directory: $BASE_DIR"
  exit 1
}

echo "Changed to directory: $(pwd)"
echo "Verifying schema file..."
if [ ! -f "prisma/schema.prisma" ]; then
  echo "ERROR: Cannot access prisma/schema.prisma from $(pwd)"
  echo "Looking for schema in current directory..."
  find . -name "schema.prisma" 2>/dev/null
  exit 1
fi

echo "✓ Prisma schema verified at: $(pwd)/prisma/schema.prisma"

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate || {
  echo "ERROR: Failed to generate Prisma Client"
  exit 1
}

# Check if migrations directory exists and has migrations
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null | grep -v '^\.gitkeep$' | wc -l)" -gt 0 ]; then
  echo "Migrations found. Running migrations..."
  npx prisma migrate deploy || {
    echo "ERROR: Migration failed"
    exit 1
  }
else
  echo "No migrations found. Pushing schema to database..."
  npx prisma db push --accept-data-loss || {
    echo "ERROR: Schema push failed"
    exit 1
  }
  echo "Schema pushed. Consider creating migrations for future deployments."
fi

echo "========================================="
echo "Database initialization completed successfully!"
echo "========================================="
