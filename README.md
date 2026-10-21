# CvTracker

A personal, local-only app to track every CV sent to every job application —
which organization, which role, which country, and which exact version of
your CV went out — plus the status timeline of each application.

Built with React, Next.js, and PostgreSQL, run locally via Docker.

## Prerequisites

- [Node.js 24+](https://nodejs.org/) — the app itself is written in Next.js,
  so you need a Node runtime to run it at all.
- [Docker](https://www.docker.com/) — this is a
  containerized environment, and the quickest way to get a real Postgres
  instance running locally without installing/configuring one by hand.

## Getting started

### Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.dev` to `.env` (or populate `.env.sample` yourself):

   ```bash
   cp .env.dev .env
   ```

3. Start Postgres:

   ```bash
   docker compose up -d db
   ```

4. Set up the database — applies every migration and seeds required
   reference data:

   ```bash
   npm run db:setup
   ```

   **4.1.** *(Optional)* Seed dev-only example data if you want something
   to develop the frontend against — never required, never run
   automatically:

   ```bash
   npm run db:seed:sample
   ```

5. Run the dev server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) and sign up — there
   is no pre-created account.

### Running fully containerized

The steps above run Postgres in Docker but Next.js locally with hot reload
— the normal day-to-day loop. To run the **whole app** containerized
instead (closer to how it'd actually be deployed):

1. `docker compose up` — starts Postgres **and** the Next.js app (built
   from the `Dockerfile`, not hot-reloading) together.
2. `npm run db:setup` — same as step 4 above.

   **2.1.** Optionally, `npm run db:seed:sample`, same as step 4.1 above.
3. App available at `http://localhost:3001` (the `APP_PORT` default —
   deliberately different from local dev's fixed `3000`, so both can run
   side by side without a port clash).
4. The database (`.container-data/postgres-data`) and uploaded documents
   (`.container-data/uploads/documents`) are bind-mounted from the host, so
   both survive `docker compose down` and container rebuilds.
5. For a full reset, `docker compose down` and delete `.container-data`
   (wipes the database, including all accounts, and the uploaded documents)
   — re-run `db:setup` afterward.

See [`docs/05-deployment.md`](./docs/05-deployment.md) for the deployment
topology (services, volumes, ports) this maps to.

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` / `npm run start` | Production build / run |
| `npm run lint` / `npm run format` | Lint / format the codebase |
| `npm run contract:generate` | Regenerate the compiled schema (`database/contract.json`/`.d.ts`) from `database/contract.ts` — run after every model change, before planning a migration |
| `npm run migrations:up` | Apply every pending migration |
| `npm run migrations:down -- <migration-dir>^` | *Plan* a rollback migration (does not apply it — see [`docs/03-architecture.md`](./docs/03-architecture.md)) |
| `npm run db:seed` | Seed required reference data (countries) |
| `npm run db:seed:sample` | Seed optional dev fixtures (an example user with data) — never required |
| `npm run db:clear:sample` | Remove the sample data, so it can be seeded again |
| `npm run db:setup` | `migrations:up` + `db:seed` — the one command for "give me a working database" |

## Documentation

See [`docs/`](./docs/00-overview.md) for the domain model, database schema,
architecture, and data access (queries, actions, route handlers) behind this project's decisions.
