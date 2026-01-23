# Fix: Prisma 7 Compatibility Error (P1012)

## Problem

Error: `The datasource property 'url' is no longer supported in schema files`

This error occurs when Prisma 7 is installed, but the schema uses Prisma 5 format.

## Solution

### Option 1: Pin Prisma to Version 5 (Recommended)

The `package.json` has been updated to pin Prisma to exactly version 5.7.1:

```json
"@prisma/client": "5.7.1",
"prisma": "5.7.1"
```

**After updating package.json:**
1. Delete `package-lock.json` (or let it regenerate)
2. Run `npm install` locally
3. Commit the new `package-lock.json`
4. Redeploy

### Option 2: Manual Fix in Production

If the error persists in production:

1. **Check Prisma version:**
   ```bash
   npx prisma --version
   ```

2. **If it shows Prisma 7, reinstall Prisma 5:**
   ```bash
   npm install prisma@5.7.1 @prisma/client@5.7.1 --save-exact
   ```

3. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Run migrations:**
   ```bash
   npx prisma db push
   ```

### Option 3: Update Dockerfile (If Needed)

If Prisma 7 keeps getting installed, add this to Dockerfile before `npm ci`:

```dockerfile
# Ensure Prisma 5 is used
RUN npm install -g prisma@5.7.1
```

## Verification

After fixing, verify:

```bash
npx prisma --version
# Should show: prisma 5.7.1
```

## Why This Happens

- `package.json` had `^5.7.1` which allows minor version updates
- Production might have installed Prisma 7.x
- Prisma 7 changed the schema format (no `url` in datasource)

## Current Configuration

- **Schema**: Uses Prisma 5 format with `url` in datasource
- **PrismaClient**: Passes URL directly (works for both versions)
- **Versions**: Pinned to 5.7.1 exactly

## Notes

- The schema format is correct for Prisma 5
- PrismaClient initialization passes URL directly for compatibility
- Versions are now pinned to prevent automatic upgrades
