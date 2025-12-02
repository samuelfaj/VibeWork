# Build stage - build from monorepo root for workspace dependencies
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy all workspace files needed for backend
COPY package.json bun.lockb* tsconfig.json ./
COPY backend/package.json ./backend/
COPY packages/contract/package.json ./packages/contract/

# Create stub package.json for workspaces not needed during backend build
RUN mkdir -p frontend e2e packages/ui && \
    echo '{"name":"@vibe/frontend","version":"0.0.0","private":true}' > frontend/package.json && \
    echo '{"name":"@vibe/e2e","version":"0.0.0","private":true}' > e2e/package.json && \
    echo '{"name":"@vibe/ui","version":"0.0.0","private":true}' > packages/ui/package.json

# Install all dependencies (ignore scripts for Docker build)
RUN bun install || true

# Copy source code
COPY packages/contract ./packages/contract
COPY backend ./backend

# Build contract first, then backend
WORKDIR /app/packages/contract
RUN bun run build

WORKDIR /app/backend
RUN bun run build

# Production stage
FROM oven/bun:1-slim
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder --chown=bun:bun /app/backend/dist ./dist
COPY --from=builder --chown=bun:bun /app/backend/node_modules ./node_modules
COPY --from=builder --chown=bun:bun /app/backend/package.json ./
COPY --from=builder --chown=bun:bun /app/packages/contract/dist ./node_modules/@vibe-code/contract/dist
COPY --from=builder --chown=bun:bun /app/packages/contract/package.json ./node_modules/@vibe-code/contract/

# Switch to non-root user (bun user exists in base image)
USER bun

EXPOSE 3000

CMD ["bun", "run", "dist/index.js"]
