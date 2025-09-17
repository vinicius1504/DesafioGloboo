FROM node:20-alpine AS base

# Development stage
FROM base AS development
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files first (for better caching)
COPY package*.json ./ 


# Install dependencies (usar npm install ao invés de npm ci)
RUN npm install

# Copy source code after dependencies are installed
COPY . .

EXPOSE 3003

CMD ["dumb-init", "npm", "run", "start:dev"]

# Production stage
FROM base AS production
WORKDIR /app

# Install dumb-init
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install 

# Copy source and build
COPY . .
RUN npm run build

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Set ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3003

CMD ["dumb-init", "node", "dist/main"]