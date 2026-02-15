FROM oven/bun:1.3.9-alpine AS build

WORKDIR /app

ARG VITE_BASE=/bomberos
ENV VITE_BASE=${VITE_BASE}

COPY . .

RUN bun install --frozen-lockfile
RUN bun run --filter frontend build

FROM oven/bun:1.3.9-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/apps/frontend/package.json ./package.json
COPY --from=build /app/apps/frontend/dist ./dist
COPY --from=build /app/apps/frontend/server.ts ./server.ts

RUN bun install --production --ignore-scripts

USER bun

EXPOSE 3000

CMD ["bun", "run", "--no-install", "server.ts"]
