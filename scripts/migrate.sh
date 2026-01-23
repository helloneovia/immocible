#!/bin/sh
# Migration script for Dokploy deployment
# This script runs Prisma migrations safely

set -e

echo "Running database migrations..."

# Generate Prisma Client
npx prisma generate

# Check if migrations exist
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "Running migrations..."
  npx prisma migrate deploy
else
  echo "No migrations found. Pushing schema..."
  npx prisma db push --accept-data-loss
fi

echo "Migrations completed successfully!"
