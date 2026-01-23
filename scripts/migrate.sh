#!/bin/sh
# Migration script for Dokploy deployment
# This script runs Prisma migrations safely

set -e

echo "Running database migrations..."

# Run migrations
npx prisma migrate deploy

echo "Migrations completed successfully!"
