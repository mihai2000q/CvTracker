# Domain Model

## Entities

### Country
Seeded reference data. Every other entity that needs a location points at
a `Country` by id, never by free-text name.

- `id`
- `name`
- `iso_code` (e.g. `DE`, `RO`) — placeholder-accurate for now, to be
  corrected later without touching foreign keys
- `flag_emoji` or `flag_url` (placeholder for now)

### Organization
A company you've applied to. One organization can have **many** job
applications over time (e.g. three different roles at Siemens).

- `id`
- `name`
- `country_id` → Country (the organization's primary/HQ location)
- `website` (optional)
- `notes` (free text, optional)
- timestamps

### CV
A single uploaded CV file, versioned/labeled by you. CVs are a **reusable
library**: the same CV can be attached to many job applications, and a
single application always points at exactly one CV — whichever version was
actually sent.

- `id`
- `label` (e.g. "v3 - backend focus", "2026-01 general") — your own naming,
  not derived
- `file_path` (location on the local filesystem/volume)
- `original_filename`
- `uploaded_at`
- `notes` (optional)

### Skill
A tag describing a technology/competency, reusable across applications
(e.g. "React", "PostgreSQL", "Kotlin"). Lets you later ask "which CV did I
use for React roles?".

- `id`
- `name` (unique)

### JobApplication
The central entity — one row per application you sent. Links an
Organization, the CV you actually sent, and the country where **that
specific role** is based (which may differ from the organization's own
country, e.g. a remote role or a foreign subsidiary).

- `id`
- `organization_id` → Organization
- `cv_id` → CV
- `country_id` → Country (role location, independent of the organization's country)
- `job_title`
- `job_posting_url` (optional)
- `source` (e.g. "LinkedIn", "Company site", "Referral", "Indeed" — free text or small enum)
- `applied_at` (date)
- `current_status` (denormalized convenience field — always equal to the
  latest entry in `ApplicationStatusHistory`, kept for cheap filtering/listing)
- `notes` (optional)
- timestamps

### ApplicationStatusHistory
An append-only timeline of status changes for a job application — this is
what answers "when did they call me, and what did I say happened next".

- `id`
- `job_application_id` → JobApplication
- `status` (e.g. `applied`, `screening`, `interview`, `offer`, `rejected`, `withdrawn`, `no_response`)
- `changed_at` (date/timestamp)
- `note` (optional free text — "recruiter called, phone screen scheduled")

### Contact
A recruiter or hiring contact associated with a job application.

- `id`
- `job_application_id` → JobApplication
- `name`
- `email` (optional)
- `phone` (optional)
- `role` (optional, e.g. "Recruiter", "Hiring Manager")

### JobApplicationSkill (join table)
Many-to-many between JobApplication and Skill — which skills/tags were
relevant to (or emphasized in) a given application.

- `job_application_id` → JobApplication
- `skill_id` → Skill

## Relationships

```mermaid
erDiagram
    COUNTRY ||--o{ ORGANIZATION : "located in"
    COUNTRY ||--o{ JOB_APPLICATION : "role located in"
    ORGANIZATION ||--o{ JOB_APPLICATION : "receives"
    CV ||--o{ JOB_APPLICATION : "sent as"
    JOB_APPLICATION ||--o{ APPLICATION_STATUS_HISTORY : "has timeline"
    JOB_APPLICATION ||--o{ CONTACT : "has"
    JOB_APPLICATION }o--o{ SKILL : "tagged with"
```

## Business rules

1. A `JobApplication` always has exactly one `CV`, one `Organization`, and
   one `Country` (the role's location). All three are required.
2. A `CV` can be reused by any number of `JobApplication` rows. Deleting a
   CV that is still referenced by an application should be prevented (or
   the application should be required to point elsewhere first) — no
   orphaned references.
3. `ApplicationStatusHistory` is append-only. To change an application's
   status you insert a new history row; you don't edit old ones. The most
   recent row (by `changed_at`, tie-broken by `id`) determines
   `JobApplication.current_status`.
4. Every new `JobApplication` implicitly gets an initial status history
   entry (`applied`, dated `applied_at`) at creation time.
5. `Country` rows are never deleted once referenced — they are reference
   data. Corrections (accurate names/flags) happen as updates in place, so
   `country_id` values on existing organizations/applications remain valid.
6. `Skill` names are unique; tagging an application with a skill that
   doesn't exist yet creates it (or the UI offers autocomplete over
   existing ones — implementation detail, not a schema constraint).
7. One organization legitimately has many job applications — this is not
   an edge case, it's the normal case the tool is built around.
