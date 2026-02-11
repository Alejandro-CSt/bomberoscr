FROM oven/bun:1.3.9-alpine AS build

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile
RUN bun run --cwd apps/api build

FROM oven/bun:1.3.9-alpine AS runner

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=9999

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/public ./public

USER bun

EXPOSE 9999

CMD ["bun", "dist/index.mjs"]
