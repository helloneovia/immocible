#!/bin/sh
# Robust database initialization script
# Handles all possible directory structures from Next.js standalone builds

set -e

echo "========================================="
echo "Database Initialization Script"
echo "========================================="

# Check DATABASE_URL first
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

# Function to find schema file
find_schema() {
  # Try common locations
  for path in \
    "/app/prisma/schema.prisma" \
    "./prisma/schema.prisma" \
    "prisma/schema.prisma" \
    "../prisma/schema.prisma"
  do
    if [ -f "$path" ]; then
      echo "$path"
      return 0
    fi
  done
  
  # Search the entire /app directory
  SCHEMA=$(find /app -name "schema.prisma" -type f 2>/dev/null | head -n 1)
  if [ -n "$SCHEMA" ]; then
    echo "$SCHEMA"
    return 0
  fi
  
  return 1
}

# Find the schema file
echo "Searching for Prisma schema..."
SCHEMA_PATH=$(find_schema)

if [ -z "$SCHEMA_PATH" ] || [ ! -f "$SCHEMA_PATH" ]; then
  echo "ERROR: Could not find schema.prisma"
  echo ""
  echo "Directory structure:"
  echo "--- /app ---"
  ls -la /app/ 2>&1 | head -20 || true
  echo ""
  echo "--- Current directory ($(pwd)) ---"
  ls -la . 2>&1 | head -20 || true
  echo ""
  echo "Searching for any .prisma files:"
  find /app -name "*.prisma" -type f 2>/dev/null || echo "None found"
  exit 1
fi

echo "✓ Found schema at: $SCHEMA_PATH"

# Get the directory containing the schema
PRISMA_DIR=$(dirname "$SCHEMA_PATH")
BASE_DIR=$(dirname "$PRISMA_DIR")

echo "Prisma directory: $PRISMA_DIR"
echo "Base directory: $BASE_DIR"

# Change to base directory
cd "$BASE_DIR" || {
  echo "ERROR: Cannot change to $BASE_DIR"
  exit 1
}

echo "Working directory: $(pwd)"

# Verify schema is accessible
if [ ! -f "prisma/schema.prisma" ]; then
  echo "ERROR: Cannot access prisma/schema.prisma from $(pwd)"
  echo "Trying alternative approach..."
  
  # Try to use the absolute path
  cd "$PRISMA_DIR"
  if [ -f "schema.prisma" ]; then
    echo "Using schema from: $(pwd)/schema.prisma"
    # Use schema from current directory
    npx prisma generate --schema=./schema.prisma
    if [ -d "migrations" ] && [ "$(ls -A migrations 2>/dev/null | grep -v '^\.gitkeep$' | wc -l)" -gt 0 ]; then
      npx prisma migrate deploy --schema=./schema.prisma
    else
      npx prisma db push --schema=./schema.prisma --accept-data-loss
    fi
    exit 0
  else
    echo "ERROR: Cannot find schema.prisma"
    exit 1
  fi
fi

echo "✓ Schema verified at: $(pwd)/prisma/schema.prisma"

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate || {
  echo "ERROR: Failed to generate Prisma Client"
  exit 1
}

# Check for migrations
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null | grep -v '^\.gitkeep$' | wc -l)" -gt 0 ]; then
  echo "Running migrations..."
  npx prisma migrate deploy || {
    echo "ERROR: Migration failed"
    exit 1
  }
else
  echo "No migrations found. Pushing schema..."
  npx prisma db push --accept-data-loss || {
    echo "ERROR: Schema push failed"
    exit 1
  }
  echo "Schema pushed successfully."
fi

echo "========================================="
echo "✓ Database initialization completed!"
echo "========================================="
