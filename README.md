# Announcement Manager

A full-stack announcement management application: a NestJS REST API backed by
PostgreSQL, and a React administrative client, in a single npm workspace.

```
React (Vite)
     │  TanStack Query
     ▼
Generated Orval client  ◄── OpenAPI spec ◄── NestJS Swagger
     │  REST
     ▼
NestJS controllers ──► services ──► feature repositories ──► Prisma ──► PostgreSQL
     │
     └─► application events ──► realtime listener ──► Socket.IO ──► connected clients
```

## Requirements

- Node.js >= 22.12 (developed against v24)
- npm >= 10
- Docker with Compose v2+

## Setup

```bash
npm install

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

npm run infra:up      # PostgreSQL (host port 5433), waits until healthy
npm run db:generate   # generate the Prisma client (git-ignored)
npm run db:migrate    # apply migrations
npm run db:seed       # deterministic seed data (idempotent)
```

PostgreSQL publishes host port **5433** (not 5432) to avoid colliding with a
locally running PostgreSQL. Override with `POSTGRES_PORT` and keep
`apps/api/.env` in sync.

## Running

```bash
npm run dev        # API + web together
npm run dev:api    # http://localhost:3000/api
npm run dev:web    # http://localhost:5173
```

Interactive API documentation (Swagger UI): **http://localhost:3000/docs**

## Testing and validation

```bash
npm test            # API integration suite + web component/unit suite
npm run lint        # ESLint (type-aware) across the workspace
npm run typecheck
npm run build
npm run format:check
```

The API tests boot the compiled application against a dedicated
`announcements_test` database (created automatically) and exercise every
mandatory behavior over real HTTP — PostgreSQL must be running
(`npm run infra:up`). The web tests use Testing Library with MSW at the
network boundary. CI (GitHub Actions) runs install → prisma generate →
generated-client drift check → lint → typecheck → test → build with a
PostgreSQL service container.

## API

Base URL `http://localhost:3000/api`. Full request/response schemas live in
Swagger (`/docs`) and in `packages/api-client/openapi.json`.

| Method | Path                 | Description                                      |
| ------ | -------------------- | ------------------------------------------------ |
| GET    | `/health`            | Liveness probe                                   |
| GET    | `/announcements`     | List; `search`, `categoryIds`, `page`, `limit`   |
| POST   | `/announcements`     | Create (requires ≥1 existing category)           |
| GET    | `/announcements/:id` | Single announcement                              |
| PATCH  | `/announcements/:id` | Partial update; `categoryIds` replaces the set   |
| DELETE | `/announcements/:id` | Delete (204)                                     |
| GET    | `/categories`        | All categories, alphabetical                     |
| POST   | `/categories`        | Create; duplicate names (case-insensitive) → 409 |

Every non-2xx response uses one error contract:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": { "title": ["Title is required"] }
}
```

`GET /announcements` supports free-text search over title **and** body
(case-insensitive), ANY-match category filtering (`categoryIds=id1,id2` or
repeated params), and pagination (`page`, `limit` ≤ 100, default 20 —
the web client uses 5 to make pagination visible with seed data). Results are
always ordered by `lastUpdate DESC`.

### Realtime (bonus)

Creating an announcement emits an application event after the PostgreSQL
commit; a listener broadcasts `announcement.created` over Socket.IO. Every
connected client shows an in-app toast and refreshes its list without a
reload. Open two browser windows, create an announcement in one, watch the
other update.

## Dates

The written specification's `MM/DD/YYYY HH:mm` format governs the UI: the
publication date is displayed and entered in that format (with a calendar +
time picker), interpreted as local time, and converted to ISO 8601 for the
API, which stores real timestamps. `lastUpdate` is server-managed — set on
create and refreshed on every meaningful update, including category-only
changes — and is never accepted from a client.

## Repository layout

```
apps/api             NestJS REST API (ESM, Prisma 7 + driver adapter)
  src/announcements  controller / service / repository / DTOs
  src/categories     controller / service / repository / normalization
  src/events         application events emitted after successful writes
  src/realtime       Socket.IO gateway + event listener
  src/common         error contract, exception filter, validation factory
  test               integration suite (boots dist/ against a test DB)
apps/web             React 19 + Vite client
  src/app            providers, router, entry
  src/layouts        admin shell (sidebar / mobile drawer)
  src/features       announcement components, hooks, schemas, utils
  src/shared         design tokens, UI kit, cross-cutting hooks
packages/api-client  OpenAPI spec + generated client + fetch transport
```
