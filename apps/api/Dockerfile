FROM oven/bun:1.3.9-alpine AS build

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile
RUN bun run --cwd apps/api build

# Strip workspace dependencies from package.json since tsdown bundles them
RUN cat apps/api/package.json \
  | sed '/@bomberoscr/d' \
  > /tmp/package.json

FROM oven/bun:1.3.9-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9999

COPY --from=build /tmp/package.json ./package.json
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/public ./public

RUN bun install --production --ignore-scripts

USER bun

EXPOSE 9999

CMD ["bun", "dist/index.mjs"]
