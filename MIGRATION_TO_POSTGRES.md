# Migration from Supabase to PostgreSQL with Prisma

This document summarizes the migration from Supabase to PostgreSQL with Prisma ORM.

## What Has Been Changed

### ✅ Completed

1. **Database Schema**
   - Created `prisma/schema.prisma` with PostgreSQL configuration
   - Defined all models: User, Profile, Bien, Recherche, Match, Favorite, Session
   - Added proper relationships and indexes

2. **Authentication System**
   - Created `lib/auth.ts` with password hashing and user management
   - Created `lib/session.ts` for session management using cookies
   - Replaced Supabase Auth with custom authentication

3. **API Routes**
   - `/api/auth/register` - User registration
   - `/api/auth/login` - User login
   - `/api/auth/logout` - User logout
   - `/api/auth/me` - Get current user
   - `/api/acquereur/matches` - Get matches for acquéreurs
   - `/api/agence/biens` - CRUD operations for biens

4. **Frontend Components**
   - Updated `contexts/AuthContext.tsx` to use new API
   - Updated `components/auth/ProtectedRoute.tsx` to use new auth
   - Updated all registration pages (`app/acquereur/inscription`, `app/agence/inscription`)
   - Updated all login pages (`app/acquereur/connexion`, `app/agence/connexion`)

5. **Prisma Client**
   - Created `lib/prisma.ts` with singleton pattern
   - Configured for development and production

## Next Steps

### 1. Install Dependencies

The following packages are already in `package.json`:
- `@prisma/client` ✅
- `prisma` ✅
- `bcryptjs` ✅

### 2. Set Up Database

1. Create a PostgreSQL database (local or cloud)
2. Add `DATABASE_URL` to your `.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/immocible?schema=public"
   ```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Run Migrations

```bash
npm run db:migrate
```

Or for development (without migration history):
```bash
npm run db:push
```

### 5. (Optional) Remove Supabase Dependencies

After confirming everything works, you can remove Supabase:

```bash
npm uninstall @supabase/supabase-js
```

And remove Supabase-related files:
- `lib/supabase.ts`
- `lib/supabase-client.ts`
- `types/supabase.ts`
- All `supabase-*.sql` files

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string

No longer needed:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database Models

### User
- Authentication and basic user info
- Roles: `acquereur` or `agence`

### Profile
- Extended user information
- Linked to User via `userId`

### Bien
- Real estate properties
- Owned by agences

### Recherche
- Search criteria from acquéreurs
- Used for matching algorithm

### Match
- Matching results between recherches and biens
- Includes score and reasons

### Favorite
- User favorites/bookmarks

### Session
- User session management
- Stored in database with expiration

## Testing

1. Test user registration:
   - `/acquereur/inscription`
   - `/agence/inscription`

2. Test user login:
   - `/acquereur/connexion`
   - `/agence/connexion`

3. Test protected routes:
   - `/acquereur/dashboard`
   - `/agence/dashboard`

4. Test API endpoints:
   - `GET /api/auth/me`
   - `GET /api/acquereur/matches`
   - `GET /api/agence/biens`

## Troubleshooting

### Prisma Client Not Generated
```bash
npm run db:generate
```

### Migration Errors
```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name init
```

### Session Issues
- Check that cookies are enabled in browser
- Verify `DATABASE_URL` is correct
- Check that Session table exists in database

## Notes

- Sessions are stored in the database and expire after 7 days
- Passwords are hashed using bcrypt with 10 rounds
- All API routes require authentication via session cookies
- Role-based access control is enforced in API routes
