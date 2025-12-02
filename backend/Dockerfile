# Build stage
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy package files first for better layer caching
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source code and build
COPY . .
RUN bun run build

# Production stage
FROM oven/bun:1-slim
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 bun && \
    adduser --system --uid 1001 --gid 1001 bun

# Copy only necessary files from builder
COPY --from=builder --chown=bun:bun /app/dist ./dist
COPY --from=builder --chown=bun:bun /app/node_modules ./node_modules
COPY --from=builder --chown=bun:bun /app/package.json ./

# Switch to non-root user
USER bun

EXPOSE 3000

CMD ["bun", "run", "dist/index.js"]
