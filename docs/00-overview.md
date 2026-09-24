# CvTracker — Overview

## Problem

Job hunting at volume breaks memory. After sending dozens of applications,
it becomes impossible to answer basic questions when a recruiter calls back:

- Which organization is this, and which of my (possibly several) applications
  to them is it about?
- What job title and requirements did I apply for?
- **Which version of my CV did I actually send them?** Skills, phrasing, and
  even the CV layout evolve over time — the CV a recruiter is holding may not
  match the CV on your desk today.
- When did I apply, and what happened since (interview scheduled, rejected,
  no response)?

CvTracker exists to answer these questions reliably.

## Goals

- Record every job application: organization, role, country, and the exact
  CV file sent.
- Track the lifecycle of an application (applied → interview → offer /
  rejected / ghosted) with dates, not just a single current state.
- Let one organization have multiple, distinct job applications over time
  (e.g. three different roles at Siemens, each with its own CV and status).
- Maintain a personal CV library — upload CV files once, reuse across
  applications, know at a glance which CV went where.
- Keep a normalized list of countries as seed data, so applications and
  organizations reference a stable `country_id` rather than free-text.
- Model the data as **user-centered** from the start: a `User` entity with
  `user_id` on the data you own (organizations, documents, job
  applications, skills), so the schema doesn't need a disruptive retrofit
  if the tool ever grows beyond one person.
- Support real **signup and sign-in**: a `User` account is created via
  signup (hashed password), authenticated via sign-in, and identified on
  every subsequent request via a signed JWT held in an HTTP-only cookie.
  No accounts are pre-seeded — the first user is created through the
  signup flow like any other.

## Non-goals (for this phase)

- **No authorization/roles beyond ownership.** Every user has identical
  capabilities over their own data; there are no admin roles, permissions,
  or sharing between users.
- **No password reset / email verification / OAuth.** Signup and sign-in
  with email + password only, for now.
- **No cloud infrastructure.** No AWS, no managed DB, no object storage.
  Everything runs locally via Docker.
- **No mobile app, no notifications, no email integration.**
- **No API routes or UI yet.** The database layer (schema, migrations,
  seed data — see [02-database-schema.md](./02-database-schema.md) and
  [03-architecture.md](./03-architecture.md)) is implemented; Next.js route
  handlers and the frontend itself are not. Exact `app/` folder structure,
  validation library, etc. are still open — see
  [03-architecture.md](./03-architecture.md)'s open questions.

## Tech stack (decided so far)

| Concern            | Choice                                            |
|---------------------|---------------------------------------------------|
| Frontend            | React                                              |
| Full-stack framework| Next.js (App Router — see [03-architecture.md](./03-architecture.md)) |
| Database            | PostgreSQL                                         |
| File storage        | Local filesystem, mounted as a Docker volume       |
| Deployment          | Docker Compose, local-only                         |
| Auth                | Signup + sign-in, stateless signed JWT in an HTTP-only cookie |
| Users               | Modeled in the data (`User`, `user_id` on owned entities); created via signup, no seeding |

## Document map

- [01-domain-model.md](./01-domain-model.md) — entities, relationships, business rules
- [02-database-schema.md](./02-database-schema.md) — PostgreSQL tables, columns, seed data
- [03-architecture.md](./03-architecture.md) — how Next.js fits together (UI + API), layering
- [04-api-design.md](./04-api-design.md) — HTTP API surface
- [05-deployment.md](./05-deployment.md) — local Docker setup
