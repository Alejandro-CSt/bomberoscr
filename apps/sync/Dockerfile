FROM node:18-alpine AS base

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN yarn global add turbo@^2
COPY . .
RUN turbo prune sync --docker

FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN corepack enable
RUN corepack prepare pnpm@10.6.3 --activate
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .

ENV SKIP_ENV_CHECK=true
RUN pnpm turbo run build --filter=sync

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeuser

COPY --from=installer /app/apps/sync/dist ./apps/sync/dist
COPY --from=installer /app/apps/sync/package.json ./apps/sync/package.json
COPY --from=installer /app/apps/sync/node_modules ./apps/sync/node_modules

RUN mkdir -p /app/apps/sync/logs
RUN chown -R nodeuser:nodejs /app/apps/sync

USER nodeuser

WORKDIR /app/apps/sync

CMD ["node", "dist/index.js"]