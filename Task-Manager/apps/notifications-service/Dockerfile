# Multi-stage build for NestJS Notifications Service
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files and packages for monorepo
COPY package.json ./
COPY apps/notifications-service/package*.json ./
COPY packages/ ./packages/

# Install dependencies
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/notifications-service/ ./
COPY packages/ ./packages/

# Build the application
RUN npm run build

# Production image, copy all the files and run nest
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

USER nestjs

EXPOSE 3004

ENV PORT=3004

# Development stage
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/notifications-service/ ./
COPY packages/ ./packages/

EXPOSE 3004
CMD ["npm", "run", "start:dev"]

# Production command
FROM runner AS production
CMD ["node", "dist/main"]