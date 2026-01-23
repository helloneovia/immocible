# Quick Fix: Prisma Version Error (P1012)

## The Error

```
Error: The datasource property `url` is no longer supported in schema files
Error code: P1012
```

This means Prisma 7 is installed, but the schema uses Prisma 5 format.

## Immediate Fix

### In Production (Dokploy Shell):

1. **Check current version:**
   ```bash
   npx prisma --version
   ```

2. **If it shows 7.x, downgrade to 5.7.1:**
   ```bash
   npm install prisma@5.7.1 @prisma/client@5.7.1 --save-exact --legacy-peer-deps
   ```

3. **Regenerate and push:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Long-term Fix

The `package.json` has been updated to pin Prisma to exactly version 5.7.1 (no `^`).

**After the next deployment:**
- Prisma 5.7.1 will be installed
- The schema format will work correctly
- No more P1012 errors

## Verify Fix

```bash
npx prisma --version
# Should output: prisma 5.7.1
```

If it still shows 7.x, the package-lock.json might need to be regenerated locally and committed.
