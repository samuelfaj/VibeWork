# Build stage - build from monorepo root for workspace dependencies
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy all workspace files needed for backend
COPY package.json bun.lockb* tsconfig.json ./
COPY backend/package.json ./backend/
COPY shared/contract/package.json ./shared/contract/

# Create stub package.json for workspaces not needed during backend build
RUN mkdir -p frontend e2e/playwright e2e/stagehand && \
    echo '{"name":"@vibe/frontend","version":"0.0.0","private":true}' > frontend/package.json && \
    echo '{"name":"@vibe/e2e-playwright","version":"0.0.0","private":true}' > e2e/playwright/package.json && \
    echo '{"name":"@vibe/e2e-stagehand","version":"0.0.0","private":true}' > e2e/stagehand/package.json

# Install all dependencies
RUN bun install || true

# Copy source code
COPY shared/contract ./shared/contract
COPY backend ./backend

# Ensure .env file exists (may be empty for local builds)
RUN touch /app/backend/.env

# Build contract package (needed for type definitions)
WORKDIR /app/shared/contract
RUN bun run build

# Create a production-ready package.json without workspace dependencies
WORKDIR /app/backend
RUN cat package.json | sed 's/"@vibe-code\/contract": "workspace:\*",//g' > package.prod.json

# Production stage - run TypeScript directly (no bundling, native modules work correctly)
FROM oven/bun:1
WORKDIR /app

# Copy source code FIRST (before node_modules install)
COPY --from=builder /app/backend/src ./src
COPY --from=builder /app/backend/modules ./modules
COPY --from=builder /app/backend/tsconfig.json ./
COPY --from=builder /app/backend/.env ./

# Copy production package.json (without workspace deps)
COPY --from=builder /app/backend/package.prod.json ./package.json

# Install production dependencies (native bindings compiled for this platform)
RUN bun install --production

# Copy contract package to node_modules
COPY --from=builder /app/shared/contract/dist ./node_modules/@vibe-code/contract/dist
COPY --from=builder /app/shared/contract/package.json ./node_modules/@vibe-code/contract/

# Switch to non-root user (bun user exists in base image)
USER bun

EXPOSE 3000

# Run TypeScript source directly - native modules load correctly
CMD ["bun", "run", "src/index.ts"]
