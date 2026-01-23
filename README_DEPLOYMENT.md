# Deployment Guide for IMMOCIBLE

This project is configured for automatic deployment with Dokploy.

## Quick Start

1. **Set up your PostgreSQL database**
   - Create a database (local or cloud)
   - Note the connection string

2. **Configure Dokploy**
   - Add your Git repository
   - Set environment variable: `DATABASE_URL`
   - Deploy!

3. **Run migrations** (first time only)
   - Use Dokploy shell: `npx prisma migrate deploy`

## Files for Dokploy

- `Dockerfile` - Multi-stage build for production
- `.dockerignore` - Excludes unnecessary files from build
- `.dokploy.yml` - Dokploy configuration
- `app/api/health/route.ts` - Health check endpoint
- `scripts/migrate.sh` - Migration script

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string

### Optional
- `NODE_ENV=production`
- `PORT=3000`
- `HOSTNAME=0.0.0.0`

## Build Process

The Dockerfile performs:
1. Installs dependencies
2. Generates Prisma Client
3. Builds Next.js application (standalone mode)
4. Creates optimized production image

## Health Checks

The application exposes a health endpoint at `/api/health` that:
- Verifies the app is running
- Checks database connectivity
- Returns status information

## Database Migrations

### First Deployment
After the first deployment, run migrations:
```bash
npx prisma migrate deploy
```

### Automatic Migrations (Optional)
To run migrations automatically on each deploy, modify the Dockerfile CMD:
```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

**Warning**: Only use automatic migrations if you're confident about your migration strategy.

## Troubleshooting

### Build Fails
- Check Node.js version (20.x required)
- Verify all dependencies are in package.json
- Check build logs

### Database Connection
- Verify DATABASE_URL format
- Ensure database is accessible
- Check firewall rules

### Health Check Fails
- Check application logs
- Verify database connection
- Ensure port 3000 is exposed

## Support

For detailed setup instructions, see:
- `DOKPLOY_SETUP.md` - Complete Dokploy setup guide
- `DATABASE_SETUP.md` - Database configuration
