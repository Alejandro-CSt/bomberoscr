FROM oven/bun:1.3.9-alpine AS build

WORKDIR /app

ARG VITE_BASE=/bomberos
ENV VITE_BASE=${VITE_BASE}

COPY . .

RUN bun install --frozen-lockfile
RUN bun run --filter frontend build

# Build a minimal package.json with only runtime dependencies (no devDependencies)
RUN apk add --no-cache jq && \
  jq 'del(.devDependencies) | .dependencies |= with_entries(select(.key | test("@tanstack/react-(devtools|query-devtools|router-devtools|start)") | not))' \
  apps/frontend/package.json > /tmp/package.json

FROM oven/bun:1.3.9-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /tmp/package.json ./package.json
COPY --from=build /app/apps/frontend/dist ./dist
COPY --from=build /app/apps/frontend/server.ts ./server.ts

RUN bun install --production --ignore-scripts

USER bun

EXPOSE 3000

CMD ["bun", "run", "--no-install", "server.ts"]
