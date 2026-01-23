#!/bin/sh
# Safe database initialization script that finds prisma schema
# This script handles different directory structures

set -e

echo "Starting database initialization..."
echo "Current directory: $(pwd)"

# Find the prisma schema file
SCHEMA_PATH=$(find /app -name "schema.prisma" -type f 2>/dev/null | head -n 1)

if [ -z "$SCHEMA_PATH" ]; then
  echo "ERROR: Could not find schema.prisma file"
  echo "Searching in /app..."
  find /app -type f -name "*.prisma" 2>/dev/null || echo "No .prisma files found"
  echo "Directory structure:"
  ls -la /app/ 2>/dev/null || echo "Cannot list /app"
  exit 1
fi

# Get the directory containing the schema
PRISMA_DIR=$(dirname "$SCHEMA_PATH")
echo "Found Prisma schema at: $SCHEMA_PATH"
echo "Prisma directory: $PRISMA_DIR"

# Change to the prisma directory
cd "$PRISMA_DIR/.." || cd /app

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

# Verify we can see the schema
if [ ! -f "prisma/schema.prisma" ]; then
  echo "ERROR: Cannot access prisma/schema.prisma from current directory"
  echo "Current directory: $(pwd)"
  echo "Looking for schema..."
  find . -name "schema.prisma" 2>/dev/null
  exit 1
fi

echo "Prisma schema verified at: $(pwd)/prisma/schema.prisma"

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Check if migrations directory exists and has migrations
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null | grep -v '^\.gitkeep$')" ]; then
  echo "Migrations found. Running migrations..."
  npx prisma migrate deploy
else
  echo "No migrations found. Pushing schema to database..."
  npx prisma db push --accept-data-loss
  echo "Schema pushed. Consider creating migrations for future deployments."
fi

echo "Database initialization completed successfully!"
