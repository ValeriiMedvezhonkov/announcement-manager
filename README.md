# Announcement Manager

A full-stack announcement management application: a NestJS REST API and a React administrative
client, in a single npm workspace.

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

npm run infra:up
```

`npm run infra:up` starts PostgreSQL and waits until it reports healthy. It publishes host port
**5433** rather than the default 5432, so it does not collide with another PostgreSQL already
running on your machine. Override with `POSTGRES_PORT` and keep `apps/api/.env` in sync.

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

Both applications were scaffolded with their official generators (`@nestjs/cli` and `create-vite`)
and then adapted to share the workspace's ESLint, Prettier and TypeScript configuration.

## Infrastructure

```bash
npm run infra:up     # start PostgreSQL, wait for healthy
npm run infra:down   # stop and remove containers
npm run infra:logs   # follow PostgreSQL logs
```
