# Use Node.js 20 LTS
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Generate Prisma Client
COPY prisma ./prisma
RUN npx prisma generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build Next.js
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public

# Copy standalone build (this contains server.js and dependencies)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma files and binaries (needed for migrations)
# IMPORTANT: Copy prisma directory to root, standalone might have its own structure
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps /app/node_modules/prisma ./node_modules/prisma

# Copy scripts
COPY --from=builder /app/scripts ./scripts

# Verify Prisma schema exists (run as root before switching user)
RUN ls -la /app/ || echo "WARNING: /app directory listing failed"
RUN ls -la /app/prisma/ || echo "WARNING: prisma directory not found"
RUN test -f /app/prisma/schema.prisma || (echo "ERROR: prisma/schema.prisma not found" && ls -la /app/ && exit 1)

# Make scripts executable before changing ownership
RUN chmod +x ./scripts/init-db.sh ./scripts/init-db-safe.sh

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run migrations on startup, then start the server
# Use the safe script that can find prisma schema in any location
CMD ["sh", "-c", "cd /app && ./scripts/init-db-safe.sh && node server.js"]
