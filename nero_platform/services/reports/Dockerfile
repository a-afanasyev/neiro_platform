FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY services/reports/package.json ./services/reports/

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/services/reports ./services/reports

# Copy source code
COPY packages/ ./packages/
COPY services/reports/ ./services/reports/
COPY tsconfig.json ./
COPY .env ./.env

# Build the service
WORKDIR /app/services/reports
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Install pnpm in production image
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy necessary files
COPY --from=builder /app/services/reports/dist ./dist
COPY --from=builder /app/services/reports/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/.env ./.env

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 reportsuser
USER reportsuser

# Expose port
EXPOSE 4009

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4009/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the service
CMD ["node", "dist/index.js"]
