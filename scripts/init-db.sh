#!/bin/sh
# Database initialization script for production
# This script runs migrations and ensures the database is set up

set -e

echo "Starting database initialization..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

# Generate Prisma Client (in case it wasn't generated during build)
echo "Generating Prisma Client..."
npx prisma generate

# Check if migrations directory exists and has migrations
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "Migrations found. Running migrations..."
  npx prisma migrate deploy
else
  echo "No migrations found. Pushing schema to database..."
  npx prisma db push --accept-data-loss
  echo "Schema pushed. Consider creating migrations for future deployments."
fi

echo "Database initialization completed successfully!"
