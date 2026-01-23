# Database Migration Guide

## Problem

If you see the error:
```
Invalid `prisma.user.findUnique()` invocation: The table `public.users` does not exist in the current database.
```

This means the database tables haven't been created yet. You need to run Prisma migrations.

## Solution

### Option 1: Automatic Migration (Recommended)

The Dockerfile has been updated to automatically run migrations on startup. Just redeploy your application and migrations will run automatically.

### Option 2: Manual Migration via Dokploy Shell

1. Open your Dokploy dashboard
2. Go to your application
3. Open the "Shell" or "Terminal" tab
4. Run:
   ```bash
   npx prisma migrate deploy
   ```

### Option 3: Create Initial Migration Locally

If you need to create the initial migration:

1. **Create the migration:**
   ```bash
   npx prisma migrate dev --name init
   ```

2. **This will create:**
   - `prisma/migrations/` directory
   - Initial migration files

3. **Commit and push the migration files**

4. **Deploy** - migrations will run automatically

### Option 4: Use `prisma db push` (Development Only)

For development/testing, you can use:
```bash
npx prisma db push
```

**Warning**: This doesn't create migration files and should NOT be used in production.

## Verification

After running migrations, verify the tables exist:

```bash
npx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
```

You should see:
- users
- profiles
- biens
- recherches
- matches
- favorites
- sessions

## Troubleshooting

### Migration Fails

1. **Check DATABASE_URL:**
   ```bash
   echo $DATABASE_URL
   ```

2. **Test connection:**
   ```bash
   npx prisma db execute --stdin <<< "SELECT 1;"
   ```

3. **Check Prisma Client:**
   ```bash
   npx prisma generate
   ```

### Tables Still Don't Exist

1. Check migration status:
   ```bash
   npx prisma migrate status
   ```

2. If migrations are pending, run:
   ```bash
   npx prisma migrate deploy
   ```

3. If no migrations exist, create them:
   ```bash
   npx prisma migrate dev --name init
   ```

## Production Checklist

- [ ] DATABASE_URL is set in environment variables
- [ ] Initial migration has been created
- [ ] Migration files are committed to Git
- [ ] Dockerfile includes migration script
- [ ] Application has been redeployed
- [ ] Tables exist in database (verify)

## Quick Fix for Production

If you need to fix this immediately:

1. **Via Dokploy Shell:**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

2. **Or use db push (temporary fix):**
   ```bash
   npx prisma db push
   ```
   Then create proper migrations later.
