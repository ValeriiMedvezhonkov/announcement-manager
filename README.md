# Announcement Manager

A full-stack announcement management application: a NestJS REST API backed by PostgreSQL, and a
React administrative client, in a single npm workspace.

> This README covers setup for the current state of the project. The full API reference and
> architecture notes are added as the corresponding features land.

## Requirements

- Node.js >= 22.12.0 (developed against v24.19.0)
- npm >= 10
- Docker with Compose v2+

## Setup

```bash
npm install

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

npm run infra:up     # PostgreSQL, waits until healthy
npm run db:migrate   # apply migrations
npm run db:seed      # deterministic seed data
```

`npm run infra:up` publishes PostgreSQL on host port **5433** rather than the default 5432, so it
does not collide with another PostgreSQL already running on your machine. Override with
`POSTGRES_PORT` and keep `apps/api/.env` in sync.

## Running

```bash
npm run dev       # API and web client together
npm run dev:api   # http://localhost:3000/api
npm run dev:web   # http://localhost:5173
```

```bash
curl http://localhost:3000/api/health
```

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npm run format:check
```

## Workspace layout

```
apps/api   NestJS REST API (ESM)
apps/web   React + Vite client
```

## Data model

PostgreSQL is the authoritative source of truth.

- **Announcement** — `id`, `title`, `body`, `publicationDate`, `lastUpdate`, `createdAt`, and a
  many-to-many relation to categories.
- **Category** — `id`, `name`, `normalizedName`, `createdAt`, `updatedAt`.

`Announcement` ↔ `Category` is a plain implicit many-to-many relation. The join carries no
attributes of its own, so no explicit join entity exists.

`lastUpdate` is server-managed and is never accepted from a client.

### Category name normalization

`Category.name` holds the human-readable form (`"Crime & Safety"`). `Category.normalizedName` holds
a deterministic lowercase form (`"crime & safety"`) and carries a **unique** database constraint, so
`"Health"`, `"health"` and `" HEALTH "` are all rejected as duplicates. The visible name is never
lowercased.

## Database commands

```bash
npm run db:generate   # regenerate the Prisma client
npm run db:migrate    # create and apply a migration
npm run db:seed       # deterministic seed (idempotent)
npm run db:studio     # browse data
```

The Prisma client is generated into `apps/api/src/generated/prisma` and is git-ignored; run
`npm run db:generate` after cloning or changing the schema.

## Infrastructure

```bash
npm run infra:up     # start PostgreSQL, wait for healthy
npm run infra:down   # stop and remove containers
npm run infra:logs   # follow PostgreSQL logs
```

## Notes

`npm audit` reports advisories in `deepmerge-ts` and `mysql2`. Both are transitive dependencies of
the **Prisma CLI**, which is a devDependency; `mysql2` is never loaded because this project uses
PostgreSQL. `npm audit fix --force` would downgrade the CLI to Prisma 6 and desynchronise it from
`@prisma/client` 7, so the advisories are accepted rather than "fixed".
