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
| name           | varchar(150)  | NOT NULL                       |
| email          | varchar(200)  | UNIQUE, NOT NULL               |
| password_hash  | text          | NOT NULL                       |
| created_at     | timestamptz   | NOT NULL DEFAULT now()         |

### `country` (seeded reference data)

| Column       | Type          | Constraints                  |
|--------------|---------------|-------------------------------|
| id           | bigserial     | PK                             |
| iso_code     | varchar(2)    | UNIQUE, NOT NULL               |
| name         | varchar(100)  | NOT NULL                       |
| flag_emoji   | varchar(8)    | NULL (placeholder for now)     |

### `organization`

| Column       | Type          | Constraints                              |
|--------------|---------------|--------------------------------------------|
| id           | bigserial     | PK                                          |
| user_id      | bigint        | FK → user(id), NOT NULL                    |
| name         | varchar(200)  | NOT NULL                                    |
| country_id   | bigint        | FK → country(id), NOT NULL                |
| website      | varchar(300)  | NULL                                         |
| notes        | text          | NULL                                         |
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

Holds both CVs and cover letters, distinguished by `document_type`. Merged
into one table because the UI displays both in a single grid — one upload
flow, one library, filtered by type rather than assembled from two tables.

| Column             | Type          | Constraints                              |
|--------------------|---------------|----------------------------------------------|
| id                 | bigserial     | PK                                             |
| user_id            | bigint        | FK → user(id), NOT NULL                       |
| document_type      | varchar(20)   | NOT NULL, `CHECK (document_type IN ('cv', 'cover_letter'))` (or native `ENUM` — open decision) |
| label              | varchar(150)  | NOT NULL                                       |
| file_path          | text          | NOT NULL                                       |
| original_filename  | varchar(255)  | NOT NULL                                       |
| uploaded_at        | timestamptz   | NOT NULL DEFAULT now()                         |
| notes              | text          | NULL                                            |

Index: `(user_id, document_type)` — the grid's primary filter dimensions.

**Type safety tradeoff:** `job_application.cv_document_id` and
`cover_letter_document_id` are both plain FKs into this one table. Postgres
cannot itself guarantee that `cv_document_id` points at a `document_type =
'cv'` row rather than a `cover_letter` one — that check is the application
layer's responsibility (see domain model rule 1a). A composite-FK approach
(`UNIQUE(id, document_type)` + a two-column FK per reference) could enforce
it at the DB level, but adds enough schema complexity that it isn't worth it
for a small local tool with no external API consumers to defend against.

### `skill`

| Column  | Type          | Constraints                          |
|---------|---------------|-----------------------------------------|
| id      | bigserial     | PK                                        |
| user_id | bigint        | FK → user(id), NOT NULL                  |
| name    | varchar(100)  | NOT NULL, `UNIQUE(user_id, name)`         |

### `job_application`

| Column            | Type          | Constraints                                  |
|-------------------|---------------|-------------------------------------------------|
| id                        | bigserial     | PK                                               |
| user_id                   | bigint        | FK → user(id), NOT NULL                         |
| organization_id           | bigint        | FK → organization(id), NOT NULL                 |
| cv_document_id            | bigint        | FK → document(id), NOT NULL (app-enforced: `document_type = 'cv'`) |
| cover_letter_document_id  | bigint        | FK → document(id), NULL (app-enforced: `document_type = 'cover_letter'`) |
| country_id                | bigint        | FK → country(id), NOT NULL                     |
| job_title         | varchar(200)  | NOT NULL                                         |
| job_posting_url   | text          | NULL                                             |
| source            | varchar(100)  | NULL                                             |
| applied_at        | date          | NOT NULL                                         |
| current_status    | varchar(30)   | NOT NULL DEFAULT 'applied'                       |
| notes             | text          | NULL                                             |
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
cheap listing/filtering; it must be kept in sync whenever a history row is
inserted (application-layer responsibility, or a DB trigger — open decision).

Suggested `current_status` / `application_status_history.status` values
(a Postgres `CHECK` constraint or native `ENUM` — open decision):
`applied`, `screening`, `interview`, `offer`, `rejected`, `withdrawn`, `no_response`.

### `application_status_history`

| Column             | Type          | Constraints                              |
|--------------------|---------------|--------------------------------------------|
| id                 | bigserial     | PK                                          |
| job_application_id | bigint        | FK → job_application(id), NOT NULL         |
| status             | varchar(30)   | NOT NULL                                    |
| changed_at         | timestamptz   | NOT NULL DEFAULT now()                      |
| note               | text          | NULL                                        |

Index: `(job_application_id, changed_at)`.

### `contact`

| Column             | Type          | Constraints                              |
|--------------------|---------------|--------------------------------------------|
| id                 | bigserial     | PK                                          |
| job_application_id | bigint        | FK → job_application(id), NOT NULL         |
| name               | varchar(150)  | NOT NULL                                    |
| email              | varchar(200)  | NULL                                        |
| phone              | varchar(50)   | NULL                                        |
| role               | varchar(100)  | NULL                                        |

### `interview_round`

| Column             | Type          | Constraints                                                          |
|--------------------|---------------|-------------------------------------------------------------------------|
| id                 | bigserial     | PK                                                                       |
| job_application_id | bigint        | FK → job_application(id), NOT NULL                                     |
| round_type         | varchar(100)  | NOT NULL                                                                 |
| scheduled_at       | timestamptz   | NOT NULL                                                                 |
| outcome            | varchar(20)   | NOT NULL DEFAULT 'scheduled' (`scheduled`, `passed`, `failed`, `cancelled`) |
| notes              | text          | NULL                                                                     |

Index: `(job_application_id, scheduled_at)`.

### `job_application_has_skill` (join table)

| Column             | Type    | Constraints                              |
|--------------------|---------|--------------------------------------------|
| job_application_id | bigint  | FK → job_application(id), PK (part 1)     |
| skill_id           | bigint  | FK → skill(id), PK (part 2)               |

## Seed data — `country`

Seed with a working ISO-3166 style set now; names/flags get corrected later
in place (see domain rule: `country_id` values never need to change).
Illustrative seed shape:

```sql
INSERT INTO country (iso_code, name, flag_emoji) VALUES
  ('DE', 'Germany', '🇩🇪'),
  ('RO', 'Romania', '🇷🇴'),
  ('AT', 'Austria', '🇦🇹'),
  ('NL', 'Netherlands', '🇳🇱'),
  ('FR', 'France', '🇫🇷'),
  ('GB', 'United Kingdom', '🇬🇧'),
  ('US', 'United States', '🇺🇸'),
  ('CH', 'Switzerland', '🇨🇭'),
  ('ES', 'Spain', '🇪🇸'),
  ('IT', 'Italy', '🇮🇹');
  -- full ISO-3166 list to be filled in during implementation
```

## Referential integrity notes

- `organization.country_id`, `job_application.country_id`: `ON DELETE
  RESTRICT` — a country should never be deletable once referenced (it's
  reference data; see domain rule 5).
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
