# Dokploy Deployment Setup

This guide explains how to deploy IMMOCIBLE to Dokploy.

## Prerequisites

1. A Dokploy instance running
2. A PostgreSQL database (can be managed by Dokploy or external)
3. Git repository with your code

## Setup Steps

### 1. Configure Environment Variables

In Dokploy, add the following environment variables:

**Required:**
```
DATABASE_URL=postgresql://username:password@host:5432/database?schema=public
NODE_ENV=production
```

**Optional:**
```
PORT=3000
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1
```

### 2. Create Application in Dokploy

1. Go to your Dokploy dashboard
2. Click "New Application"
3. Select "Docker" as the deployment method
4. Connect your Git repository
5. Set the following:
   - **Build Command**: (leave empty, Dockerfile handles it)
   - **Start Command**: (leave empty, Dockerfile handles it)
   - **Port**: `3000`
   - **Dockerfile Path**: `Dockerfile` (or leave default)

### 3. Database Setup

#### Option A: External PostgreSQL

1. Create a PostgreSQL database (e.g., on Railway, Supabase, or your own server)
2. Add the connection string to `DATABASE_URL` environment variable
3. Run migrations manually or set up a migration script

#### Option B: PostgreSQL via Dokploy

1. Create a PostgreSQL service in Dokploy
2. Link it to your application
3. Use the connection string provided by Dokploy

### 4. Run Database Migrations

After the first deployment, you need to run migrations. You can do this in two ways:

#### Option A: Via Dokploy Shell

1. Open the application shell in Dokploy
2. Run:
   ```bash
   npx prisma migrate deploy
   ```

#### Option B: Add Migration to Build Process

Modify the Dockerfile to include migrations (see advanced setup below).

### 5. Deploy

1. Push your code to the connected Git repository
2. Dokploy will automatically:
   - Build the Docker image
   - Run the application
   - Health check will verify the app is running

## Dockerfile Explanation

The Dockerfile uses a multi-stage build:

1. **deps**: Installs dependencies and generates Prisma Client
2. **builder**: Builds the Next.js application
3. **runner**: Creates the production image with only necessary files

## Health Check

The application includes a health check endpoint at `/api/health` that:
- Verifies the application is running
- Checks database connectivity
- Returns status information

## Environment Variables Reference

| Variable | Required | Description |
|---------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | No | Port to run on (default: 3000) |
| `HOSTNAME` | No | Hostname to bind to (default: 0.0.0.0) |

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify Node.js version matches (20.x)
- Check build logs in Dokploy

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is accessible from Dokploy server
- Ensure database exists and is running

### Migrations Not Running

- Run migrations manually via Dokploy shell
- Or add migration step to Dockerfile (see advanced setup)

### Health Check Failing

- Check application logs
- Verify database connection
- Ensure port 3000 is exposed

## Advanced Setup

### Auto-run Migrations on Deploy

To automatically run migrations on each deploy, modify the Dockerfile CMD:

```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

**Note**: This runs migrations on every deployment. Use with caution in production.

### Custom Build Arguments

You can add build arguments to the Dockerfile for environment-specific builds:

```dockerfile
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
```

### Persistent Storage

If you need persistent storage (e.g., for uploads), configure volumes in Dokploy:
- Mount point: `/app/uploads`
- Volume size: As needed

## Monitoring

- Check application logs in Dokploy dashboard
- Monitor health check endpoint: `https://your-domain.com/api/health`
- Set up alerts for health check failures

## Security Notes

1. Never commit `.env` files
2. Use Dokploy's secret management for sensitive data
3. Enable HTTPS in Dokploy settings
4. Keep dependencies updated
5. Use strong database passwords

## Next Steps

After deployment:

1. Verify the application is accessible
2. Test user registration and login
3. Check database migrations ran successfully
4. Monitor logs for any errors
5. Set up backups for your database
