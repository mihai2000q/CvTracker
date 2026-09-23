# Database Schema (PostgreSQL)

This describes the schema conceptually and with illustrative DDL. The exact
migration tooling (raw SQL migrations vs. an ORM like Prisma/Drizzle) is an
**implementation-phase decision**, not fixed here — this document defines
the shape the tool must produce, not how.

Naming convention: `snake_case` tables and columns, singular table names
avoided in favor of plural (`countries`, `organizations`, ...), surrogate
`id` primary keys (`bigserial` or `uuid` — open decision, examples below use
`bigserial` for readability).

## Tables

### `countries` (seeded reference data)

| Column       | Type          | Constraints                  |
|--------------|---------------|-------------------------------|
| id           | bigserial     | PK                             |
| iso_code     | varchar(2)    | UNIQUE, NOT NULL               |
| name         | varchar(100)  | NOT NULL                       |
| flag_emoji   | varchar(8)    | NULL (placeholder for now)     |

### `organizations`

| Column       | Type          | Constraints                              |
|--------------|---------------|--------------------------------------------|
| id           | bigserial     | PK                                          |
| name         | varchar(200)  | NOT NULL                                    |
| country_id   | bigint        | FK → countries(id), NOT NULL                |
| website      | varchar(300)  | NULL                                         |
| notes        | text          | NULL                                         |
| created_at   | timestamptz   | NOT NULL DEFAULT now()                      |
| updated_at   | timestamptz   | NOT NULL DEFAULT now()                      |

Index: `(name)` for lookup/autocomplete when logging a new application.

### `cvs`

| Column             | Type          | Constraints                    |
|--------------------|---------------|----------------------------------|
| id                 | bigserial     | PK                                |
| label              | varchar(150)  | NOT NULL                          |
| file_path          | text          | NOT NULL                          |
| original_filename  | varchar(255)  | NOT NULL                          |
| uploaded_at        | timestamptz   | NOT NULL DEFAULT now()            |
| notes              | text          | NULL                              |

### `skills`

| Column | Type          | Constraints          |
|--------|---------------|------------------------|
| id     | bigserial     | PK                      |
| name   | varchar(100)  | UNIQUE, NOT NULL        |

### `cover_letters`

Identical shape to `cvs` — a separate table (not a shared "documents" table
with a type column) because CVs and cover letters have distinct lifecycles
and, later, may need different metadata.

| Column             | Type          | Constraints                    |
|--------------------|---------------|----------------------------------|
| id                 | bigserial     | PK                                |
| label              | varchar(150)  | NOT NULL                          |
| file_path          | text          | NOT NULL                          |
| original_filename  | varchar(255)  | NOT NULL                          |
| uploaded_at        | timestamptz   | NOT NULL DEFAULT now()            |
| notes              | text          | NULL                              |

### `job_applications`

| Column            | Type          | Constraints                                  |
|-------------------|---------------|-------------------------------------------------|
| id                | bigserial     | PK                                               |
| organization_id   | bigint        | FK → organizations(id), NOT NULL                 |
| cv_id             | bigint        | FK → cvs(id), NOT NULL                           |
| cover_letter_id   | bigint        | FK → cover_letters(id), NULL (optional)          |
| country_id        | bigint        | FK → countries(id), NOT NULL                     |
| job_title         | varchar(200)  | NOT NULL                                         |
| job_posting_url   | text          | NULL                                             |
| source            | varchar(100)  | NULL                                             |
| applied_at        | date          | NOT NULL                                         |
| current_status    | varchar(30)   | NOT NULL DEFAULT 'applied'                       |
| notes             | text          | NULL                                             |
| created_at        | timestamptz   | NOT NULL DEFAULT now()                           |
| updated_at        | timestamptz   | NOT NULL DEFAULT now()                           |

Indexes: `(organization_id)`, `(cv_id)`, `(cover_letter_id)`, `(country_id)`,
`(applied_at)`, `(current_status)` — these are the expected filter/sort
dimensions in the UI.

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
| job_application_id | bigint        | FK → job_applications(id), NOT NULL         |
| status             | varchar(30)   | NOT NULL                                    |
| changed_at         | timestamptz   | NOT NULL DEFAULT now()                      |
| note               | text          | NULL                                        |

Index: `(job_application_id, changed_at)`.

### `contacts`

| Column             | Type          | Constraints                              |
|--------------------|---------------|--------------------------------------------|
| id                 | bigserial     | PK                                          |
| job_application_id | bigint        | FK → job_applications(id), NOT NULL         |
| name               | varchar(150)  | NOT NULL                                    |
| email              | varchar(200)  | NULL                                        |
| phone              | varchar(50)   | NULL                                        |
| role               | varchar(100)  | NULL                                        |

### `interview_rounds`

| Column             | Type          | Constraints                                                          |
|--------------------|---------------|-------------------------------------------------------------------------|
| id                 | bigserial     | PK                                                                       |
| job_application_id | bigint        | FK → job_applications(id), NOT NULL                                     |
| round_type         | varchar(100)  | NOT NULL                                                                 |
| scheduled_at       | timestamptz   | NOT NULL                                                                 |
| outcome            | varchar(20)   | NOT NULL DEFAULT 'scheduled' (`scheduled`, `passed`, `failed`, `cancelled`) |
| notes              | text          | NULL                                                                     |

Index: `(job_application_id, scheduled_at)`.

### `job_application_skills` (join table)

| Column             | Type    | Constraints                              |
|--------------------|---------|--------------------------------------------|
| job_application_id | bigint  | FK → job_applications(id), PK (part 1)     |
| skill_id           | bigint  | FK → skills(id), PK (part 2)               |

## Seed data — `countries`

Seed with a working ISO-3166 style set now; names/flags get corrected later
in place (see domain rule: `country_id` values never need to change).
Illustrative seed shape:

```sql
INSERT INTO countries (iso_code, name, flag_emoji) VALUES
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

- `organizations.country_id`, `job_applications.country_id`: `ON DELETE
  RESTRICT` — a country should never be deletable once referenced (it's
  reference data; see domain rule 5).
- `job_applications.cv_id`: `ON DELETE RESTRICT` — protects against
  orphaning an application by deleting the CV it was sent with.
- `job_applications.cover_letter_id`: `ON DELETE RESTRICT` when set — same
  reasoning as `cv_id`, just nullable.
- `job_applications.organization_id`: `ON DELETE RESTRICT` — an
  organization with applications shouldn't disappear silently.
- `application_status_history.job_application_id`,
  `contacts.job_application_id`, `interview_rounds.job_application_id`,
  `job_application_skills.*`: `ON DELETE CASCADE` — these are owned by the
  job application; deleting an application should clean up its timeline,
  contacts, interview rounds, and tags.
