# https://turbo.build/repo/docs/guides/tools/docker#example
FROM node:18-alpine AS base

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app
RUN yarn global add turbo@2
COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
RUN turbo prune sync --docker

FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN corepack enable
RUN corepack prepare pnpm@10.6.3 --activate
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
RUN SKIP_ENV_CHECK=true pnpm turbo run build --env-mode=loose
RUN pnpm prune

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeuser

# Option 1: Create the expected directory structure
RUN mkdir -p /app/apps/sync/
COPY --from=installer --chown=nodeuser:nodejs /app/apps/sync/dist/ /app/apps/sync/dist/

# Install dependencies needed for runtime
COPY --from=installer /app/packages ./packages
COPY --from=installer /app/apps/sync/package.json ./apps/sync/package.json
COPY --from=installer /app/pnpm-workspace.yaml ./
COPY --from=installer /app/package.json ./
COPY --from=installer /app/pnpm-lock.yaml ./

WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@10.6.3 --activate
RUN pnpm install --prod

USER nodeuser

CMD ["node", "apps/sync/dist/index.js"]