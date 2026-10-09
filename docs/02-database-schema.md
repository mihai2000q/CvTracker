# Database Schema (PostgreSQL)

This describes the schema conceptually and with illustrative DDL — the
shape the tool must produce. The actual source of truth once implemented is
`database/contract.ts` (Prisma 8's code-first schema); see
[03-architecture.md](./03-architecture.md#orm-and-migrations-prisma) for how
that's generated and migrated.

Naming convention: `snake_case` tables and columns, **singular** table
names (`country`, `organization`, ...) — Prisma 8's naming config has no
pluralization option (confirmed against the official docs), so this is
its default rather than a deliberate choice; the two join tables
(`organization_in_country`, `job_application_has_skill`) are named
explicitly since a compound name isn't derivable from the model name
either way. Surrogate `id` primary keys (`bigserial` or `uuid` — open
decision, examples below use `bigserial` for readability).

## Tables

### `user`

Minimal on purpose — no profile image, no roles. Rows are created only by
the signup endpoint; there is no seed data for this table (contrast with
`country` below, which is seeded).

| Column         | Type          | Constraints                  |
|----------------|---------------|-------------------------------|
| id             | bigserial     | PK                             |
| email          | varchar(255)  | UNIQUE, NOT NULL               |
| name           | varchar(150)  | NOT NULL                       |
| password_hash  | text          | NOT NULL                       |
| created_at     | timestamptz   | NOT NULL DEFAULT now()         |
| updated_at     | timestamptz   | NOT NULL DEFAULT now()         |

### `country` (seeded reference data)

No flag column — flags are rendered from `iso_code` via
[flag-icons](https://flagicons.lipis.dev/) at the UI layer, not stored.

| Column       | Type          | Constraints                  |
|--------------|---------------|-------------------------------|
| id           | bigserial     | PK                             |
| iso_code     | varchar(2)    | UNIQUE, NOT NULL               |
| name         | varchar(100)  | NOT NULL                       |

### `organization`

No `country_id` here — an organization's countries are the many-to-many
set in `organization_in_country` below, not a single column.

| Column       | Type          | Constraints                              |
|--------------|---------------|--------------------------------------------|
| id           | bigserial     | PK                                          |
| name         | varchar(200)  | NOT NULL                                    |
| notes        | text          | NULL                                         |
| website_url  | text          | NULL                                         |
| user_id      | bigint        | FK → user(id), NOT NULL                    |
| created_at   | timestamptz   | NOT NULL DEFAULT now()                      |
| updated_at   | timestamptz   | NOT NULL DEFAULT now()                      |

Index: `(user_id, name)` for lookup/autocomplete when logging a new
application, scoped to the current user.

### `organization_in_country` (join table)

The broader set of countries an organization operates in, beyond its
primary `country_id` — used only to filter the country dropdown on the
job-application form. Written wholesale by the organization create/update
endpoints (full replace), never via a dedicated add/remove endpoint.

| Column          | Type    | Constraints                              |
|-----------------|---------|--------------------------------------------|
| organization_id | bigint  | FK → organization(id), PK (part 1)        |
| country_id      | bigint  | FK → country(id), PK (part 2)            |

### `document`

Holds both CVs and cover letters, distinguished by `type`. Merged
into one table because the UI displays both in a single grid — one upload
flow, one library, filtered by type rather than assembled from two tables.

| Column             | Type          | Constraints                              |
|--------------------|---------------|----------------------------------------------|
| id                 | bigserial     | PK                                             |
| type               | native `ENUM` | NOT NULL — `DocumentType` (`cv`, `cover_letter`) |
| name               | varchar(150)  | NOT NULL                                       |
| file_path          | text          | NOT NULL                                       |
| original_filename  | varchar(255)  | NOT NULL                                       |
| size               | integer       | NOT NULL — file size in bytes                  |
| notes              | text          | NULL                                            |
| user_id            | bigint        | FK → user(id), NOT NULL                       |
| uploaded_at        | timestamptz   | NOT NULL DEFAULT now()                         |

Index: `(user_id, type)` — the grid's primary filter dimensions.

**Type safety tradeoff:** `job_application.cv_document_id` and
`cover_letter_document_id` are both plain FKs into this one table. Postgres
cannot itself guarantee that `cv_document_id` points at a `type =
'cv'` row rather than a `cover_letter` one — that check is the application
layer's responsibility (see domain model rule 1a). A composite-FK approach
(`UNIQUE(id, type)` + a two-column FK per reference) could enforce
it at the DB level, but adds enough schema complexity that it isn't worth it
for a small local tool with no external API consumers to defend against.

### `skill`

| Column  | Type          | Constraints                          |
|---------|---------------|-----------------------------------------|
| id      | bigserial     | PK                                        |
| name    | varchar(100)  | NOT NULL, `UNIQUE(user_id, name)`         |
| user_id | bigint        | FK → user(id), NOT NULL                  |

### `job_application`

| Column            | Type          | Constraints                                  |
|-------------------|---------------|-------------------------------------------------|
| id                        | bigserial     | PK                                               |
| title             | varchar(200)  | NOT NULL                                         |
| posting_url       | text          | NULL                                             |
| source            | varchar(100)  | NULL                                             |
| current_status    | native `ENUM` | NOT NULL DEFAULT 'applied' — `ApplicationStatus` |
| applied_at        | date          | NOT NULL                                         |
| notes             | text          | NULL                                             |
| organization_id           | bigint        | FK → organization(id), NOT NULL                 |
| cv_document_id            | bigint        | FK → document(id), NOT NULL (app-enforced: `type = 'cv'`) |
| cover_letter_document_id  | bigint        | FK → document(id), NULL (app-enforced: `type = 'cover_letter'`) |
| country_id                | bigint        | FK → country(id), NOT NULL                     |
| user_id                   | bigint        | FK → user(id), NOT NULL                         |
| created_at        | timestamptz   | NOT NULL DEFAULT now()                           |
| updated_at        | timestamptz   | NOT NULL DEFAULT now()                           |

Indexes: `(user_id, organization_id)`, `(cv_document_id)`,
`(cover_letter_document_id)`, `(user_id, country_id)`, `(user_id, applied_at)`,
`(user_id, current_status)` — `user_id` leads every composite index since
virtually every query is scoped to the current user first.

`daysSinceLastUpdate`, `needsFollowUp`, and `isGhosted` (see
[01-domain-model.md](./01-domain-model.md#derived--computed-fields-not-stored))
are **not columns** — they're computed by the application layer from
`applied_at` and `application_status_history.changed_at` at read time.

`current_status` is denormalized from `application_status_history` for
cheap listing/filtering; it is kept in sync by the **application layer**
whenever a history row is inserted — no DB trigger. Keeping this logic in
the application (not the database) matches the rest of the schema: no other
business rule here relies on triggers/stored procedures either.

`current_status` / `application_status_history.status` are implemented as
a native Postgres `ENUM` (`ApplicationStatus` in `database/enums.ts`), not
a `CHECK` constraint — this is decided, not open. Values: `applied`,
`screening`, `interview`, `offer`, `rejected`, `withdrawn`, `no_response`.

### `application_status_history`

| Column             | Type          | Constraints                              |
|--------------------|---------------|--------------------------------------------|
| id                 | bigserial     | PK                                          |
| status             | native `ENUM` | NOT NULL — `ApplicationStatus`              |
| note               | text          | NULL                                        |
| job_application_id | bigint        | FK → job_application(id), NOT NULL         |
| changed_at         | timestamptz   | NOT NULL DEFAULT now()                      |

Index: `(job_application_id, changed_at)`.

### `contact`

| Column             | Type          | Constraints                              |
|--------------------|---------------|--------------------------------------------|
| id                 | bigserial     | PK                                          |
| name               | varchar(150)  | NOT NULL                                    |
| email              | varchar(255)  | NULL                                        |
| phone              | varchar(50)   | NULL                                        |
| role               | varchar(100)  | NULL                                        |
| job_application_id | bigint        | FK → job_application(id), NOT NULL         |

### `interview_round`

| Column             | Type          | Constraints                                                          |
|--------------------|---------------|-------------------------------------------------------------------------|
| id                 | bigserial     | PK                                                                       |
| round_type         | varchar(100)  | NOT NULL                                                                 |
| scheduled_at       | timestamptz   | NOT NULL                                                                 |
| outcome            | native `ENUM` | NOT NULL DEFAULT 'scheduled' — `InterviewOutcome` (`scheduled`, `passed`, `failed`, `cancelled`) |
| notes              | text          | NULL                                                                     |
| job_application_id | bigint        | FK → job_application(id), NOT NULL                                     |

Index: `(job_application_id, scheduled_at)`.

### `job_application_has_skill` (join table)

| Column             | Type    | Constraints                              |
|--------------------|---------|--------------------------------------------|
| job_application_id | bigint  | FK → job_application(id), PK (part 1)     |
| skill_id           | bigint  | FK → skill(id), PK (part 2)               |

### `document_has_skill` (join table)

| Column      | Type    | Constraints                              |
|-------------|---------|--------------------------------------------|
| document_id | bigint  | FK → document(id), PK (part 1)            |
| skill_id    | bigint  | FK → skill(id), PK (part 2)               |

## Seed data — `country`

Seeded via `npm run db:seed` (part of `db:setup`), not baked into a
migration — Prisma 8 has no first-class seeding concept (confirmed against
the official docs: "write a TypeScript script that imports your `db`
instance... invoke it from `package.json`'s scripts" is the documented
workaround). Corrections (names, additions) happen by re-running it,
matching domain rule 5 (`country_id` values never need to change, only the
row's own data does).

This is `database/reference-data/`, not `database/sample-data/` — countries
are required for the app to function at all (every `Organization` and
`JobApplication` needs one), unlike the separate, genuinely-optional
`sample-data/` fixtures (e.g. a dev example user) covered in
[03-architecture.md](./03-architecture.md#seeding-reference-data-vs-sample-data).

- `database/reference-data/countries.ts` holds the list and a
  `seedCountries(db)` function that upserts each row by `iso_code` (create
  if missing, update `name` if it already exists).
- `database/reference-data/index.ts` is the explicit run order for all
  reference-data modules (just `countries` for now) — order lives in this
  one file, not in filenames, so adding a new module later is one import +
  one call, no renumbering.
- `database/seed-reference-data.ts` is the entrypoint
  (`node database/seed-reference-data.ts`, or `npm run db:seed`) that opens
  the `db` client and runs them.

The full ISO 3166-1 alpha-2 list (249 entries). Codes are hardcoded directly
(stable — rarely changes); names were generated once via Node's built-in
`Intl.DisplayNames` rather than hand-typed or scraped from a third-party
source, with a handful of CLDR's short-form names overridden for clarity
(e.g. `CD` → "Democratic Republic of the Congo" instead of "Congo -
Kinshasa") and `&` normalized to "and" throughout. This was a one-time
generation, not something computed at seed-run time — the committed array
in `countries.ts` is the source of truth, so the data can't shift if a
future Node/ICU version resolves a name differently.

## Referential integrity notes

- `job_application.country_id`: `ON DELETE RESTRICT` — a country should
  never be deletable once referenced (it's reference data; see domain
  rule 5).
- `job_application.cv_document_id`: `ON DELETE RESTRICT` — protects
  against orphaning an application by deleting the document it was sent
  with.
- `job_application.cover_letter_document_id`: `ON DELETE RESTRICT` when
  set — same reasoning, just nullable.
- `job_application.organization_id`: `ON DELETE RESTRICT` — an
  organization with applications shouldn't disappear silently.
- `application_status_history.job_application_id`,
  `contact.job_application_id`, `interview_round.job_application_id`,
  `job_application_has_skill.*`: `ON DELETE CASCADE` — these are owned by
  the job application; deleting an application should clean up its
  timeline, contact, interview rounds, and tags.
- `organization_in_country.organization_id`: `ON DELETE CASCADE` —
  owned by the organization; deleting an organization clears its country
  set with it.
- `organization_in_country.country_id`: `ON DELETE RESTRICT` — same
  reference-data protection as every other `country_id` FK (domain rule 5).
- `organization.user_id`, `document.user_id`, `skill.user_id`,
  `job_application.user_id`: `ON DELETE CASCADE` — deleting a user (an
  account-deletion feature, not currently exposed via the API) removes all
  of their owned data.
