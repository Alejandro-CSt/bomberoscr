# Repository Guidelines

## Project Structure & Module Organization

This repository is a Bun workspace monorepo:

- `apps/api`: Hono API (`src/routers`, `src/schemas`, `src/lib`).
- `apps/frontend`: TanStack Start frontend (`src/routes`, `src/components`, `src/lib`).
- `apps/sync-v2`: BullMQ-based sync workers and queues.
- `apps/sync`: legacy sync service.
- `packages/*`: shared modules (`db`, `lib`, `sync-domain`, `sigae`, `typescript-config`).

Keep feature logic close to its boundary (API route + schema + DB query). In frontend, treat generated files like `src/lib/api/*.gen.ts` and `src/routeTree.gen.ts` as generated artifacts (do not edit manually).

## Build, Test, and Development Commands

- `bun install`: install all workspace dependencies.
- `bun run dev`: run API + frontend via `mprocs`.
- `bun run dev:all`: run API + frontend + `sync-v2`.
- `bun run dev:api` / `bun run dev:frontend` / `bun run dev:sync`: run one app.
- `bun run lint:check`: run lint checks for API and frontend.
- `bun run format:check`: verify formatting for API and frontend.
- `bun run --cwd apps/api test`: run API tests (Vitest).
- `bun run --cwd apps/frontend test`: run frontend tests (Vitest).
- `bun run --cwd apps/sync-v2 test`: run sync-v2 tests (Vitest).

For DB tasks, use `packages/db` scripts (example: `bun run --cwd packages/db drizzle:generate`).

## Coding Style & Naming Conventions

TypeScript with strict settings is standard across apps/packages. Formatting is enforced with `oxfmt` (2 spaces, semicolons, double quotes, max width 100). Linting uses `oxlint`.

Use `@/*` path aliases for app-local imports. Prefer kebab-case file names (`incident-types.ts`), and follow existing router naming conventions (`__root.tsx`, `$slug.tsx`).
