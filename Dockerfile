# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Run Stage
FROM node:20-alpine AS runner

WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

ENV NODE_ENV=production

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built files and necessary runtime files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/entrypoint.sh ./
COPY --from=builder /app/drizzle.config.ts ./

# Copy runtime dependencies
COPY --from=builder /app/services ./services
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/db ./db
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/utils ./utils
COPY --from=builder /app/constants ./constants
COPY --from=builder /app/validations ./validations
COPY --from=builder /app/types ./types
COPY --from=builder /app/middlewares ./middlewares

# Install tsx globally for running TypeScript
RUN pnpm add -g tsx

# Make entrypoint executable
RUN chmod +x ./entrypoint.sh

# Create uploads directory
RUN mkdir -p /app/public/uploads

EXPOSE 3000

# Start application
ENTRYPOINT ["./entrypoint.sh"]
