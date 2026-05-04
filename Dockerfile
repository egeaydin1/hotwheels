# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile scripts to plain JS so no tsx is needed at runtime
RUN for script in scripts/import-hotwheels-data.ts scripts/fetch-photos.ts; do \
      npx tsc "$script" --module commonjs --target es2019 \
        --esModuleInterop --skipLibCheck --outDir dist/scripts; \
    done

# Production build
RUN npm run build

# ── Stage 3: Production runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl \
 && addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Next.js standalone server
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public

# Prisma: schema + migrations + generated client + CLI binary
COPY --from=builder --chown=nextjs:nodejs /app/prisma                   ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma     ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma     ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Compiled seed script + Hot Wheels data
COPY --from=builder --chown=nextjs:nodejs /app/dist/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/data         ./data

# Entrypoint (runs migrations → optional seed → server)
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["./docker-entrypoint.sh"]
