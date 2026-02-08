FROM oven/bun:1.3.6-alpine AS build

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile
RUN bun run --filter frontend build

FROM oven/bun:1.3.6-alpine AS runner

WORKDIR /app/apps/frontend

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/apps/frontend/dist ./dist
COPY --from=build /app/apps/frontend/server.ts ./server.ts

EXPOSE 3000

CMD ["bun", "run", "server.ts"]
