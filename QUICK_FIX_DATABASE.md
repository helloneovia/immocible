# Quick Fix: Database Tables Don't Exist

## Immediate Fix (Production)

If you're seeing the error:
```
Invalid `prisma.user.findUnique()` invocation: The table `public.users` does not exist
```

### Option 1: Run via Dokploy Shell (Fastest)

1. Go to your Dokploy dashboard
2. Open your application
3. Click on "Shell" or "Terminal"
4. Run:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

This will create all tables immediately.

### Option 2: Wait for Next Deployment

The Dockerfile has been updated to automatically run migrations on startup. After the next deployment, tables will be created automatically.

## Verification

After running the fix, verify tables exist:

```bash
npx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
```

You should see:
- biens
- favorites
- matches
- profiles
- recherches
- sessions
- users

## Long-term Solution

For future deployments, create proper migrations:

1. **Locally:**
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Commit the migration files:**
   ```bash
   git add prisma/migrations
   git commit -m "Add initial database migration"
   git push
   ```

3. **Future deployments will use migrations automatically**

## Notes

- `prisma db push` is fine for initial setup
- For production, use `prisma migrate deploy` after creating migrations
- The updated Dockerfile will handle this automatically
