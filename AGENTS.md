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

## Cursor Cloud specific instructions

### Prerequisites

- **Bun 1.3.9** is required (declared in `packageManager` field of root `package.json`). Install via `curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.9"`.
- **PostgreSQL** must be running on port 5432 with user `postgres` / password `postgres` and database `emergenciascr`.

### Database setup

After PostgreSQL is running, the schema must be pushed with `bun run --cwd packages/db drizzle:push --force`. A known drizzle-kit issue: the `media_type` enum must be created manually before the first push (`CREATE TYPE media_type AS ENUM ('image', 'video');`), or drizzle-kit will fail. After the initial push, drizzle-kit will also attempt to `DROP TYPE media_type` at the end and error — this is harmless; all tables are created successfully despite the trailing error.

### Environment files

Copy `.env.example` to `.env` in `apps/api`, `apps/frontend`, and `packages/db`. In `apps/api/.env`, comment out or remove empty `SIGAE_*` variables — they are `z.string().url().optional()` in the Zod schema, so an empty string fails validation while `undefined` (absent) passes. Fill IMGPROXY/S3/MAPBOX values with placeholder strings (any non-empty string) for local dev.

### Running services

- `bun run dev:api` starts the API on port 9999 (hot-reloading via `bun --hot`).
- `bun run dev:frontend` starts the TanStack Start frontend on port 3000.
- `bun run dev` runs both via `mprocs`.
- See root `package.json` scripts and `AGENTS.md` "Build, Test, and Development Commands" for full list.

### Testing

All three test suites (`apps/api`, `apps/frontend`, `apps/sync-v2`) use Vitest but currently have no test files. Running `bun run --cwd <app> test` will exit with code 1 ("No test files found") — this is expected, not a failure.
