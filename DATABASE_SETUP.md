# PostgreSQL Database Setup Guide

This project uses PostgreSQL with Prisma ORM.

## Prerequisites

- PostgreSQL installed and running locally, OR
- A PostgreSQL database service (like Supabase, Railway, Neon, etc.)

## Setup Steps

### 1. Install Dependencies

Make sure all dependencies are installed:

```bash
npm install
```

### 2. Configure Database Connection

Create a `.env` file in the root directory with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/immocible?schema=public"
```

**For different environments:**

- **Local PostgreSQL:**
  ```
  DATABASE_URL="postgresql://postgres:password@localhost:5432/immocible?schema=public"
  ```

- **Cloud PostgreSQL (Supabase, Railway, Neon, etc.):**
  ```
  DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres?schema=public"
  ```

- **Railway/Neon/Other:**
  ```
  DATABASE_URL="[YOUR_CONNECTION_STRING]"
  ```

### 3. Generate Prisma Client

Generate the Prisma Client based on your schema:

```bash
npm run db:generate
```

### 4. Run Database Migrations

Create and apply the database schema:

```bash
npm run db:migrate
```

Or if you prefer to push the schema without migrations (for development):

```bash
npm run db:push
```

### 5. (Optional) Open Prisma Studio

View and manage your database with Prisma Studio:

```bash
npm run db:studio
```

This will open a web interface at `http://localhost:5555` where you can view and edit your data.

## Database Schema

The database includes the following models:

- **User**: Authentication and user accounts (acquereur/agence)
- **Profile**: Extended user profile information
- **Bien**: Real estate properties
- **Recherche**: Search criteria from acquéreurs
- **Match**: Matching results between recherches and biens
- **Favorite**: User favorites/bookmarks

## Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string

## Troubleshooting

### Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Test connection:
   ```bash
   psql $DATABASE_URL
   ```

### Migration Issues

If you encounter migration errors:

1. Reset the database (⚠️ **WARNING**: This will delete all data):
   ```bash
   npx prisma migrate reset
   ```

2. Or manually fix the migration:
   ```bash
   npx prisma migrate dev
   ```

### Prisma Client Not Generated

If you see errors about Prisma Client not being found:

```bash
npm run db:generate
```

## Production Deployment

For production:

1. Set `DATABASE_URL` in your hosting environment variables
2. Run migrations during deployment:
   ```bash
   npx prisma migrate deploy
   ```
3. Generate Prisma Client:
   ```bash
   npm run db:generate
   ```

## Next Steps

After setting up the database:

1. Update your API routes to use Prisma instead of Supabase
2. Update authentication to work with your chosen auth solution
3. Test the database connection with sample data
