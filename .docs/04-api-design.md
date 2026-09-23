# API Design

All endpoints are Next.js Route Handlers under `app/api/**`, returning JSON
(`multipart/form-data` for the one upload endpoint). No authentication — the
tool is single-user and local-only, so every endpoint is unauthenticated by
design.

This is the conceptual surface — request/response field shapes will be
refined during implementation, but the resources and verbs below are meant
to be stable, since they map directly to the domain model.

## Countries

| Method | Path              | Purpose                              |
|--------|-------------------|----------------------------------------|
| GET    | `/api/countries`  | List all countries (for dropdowns)    |

Countries are seeded, read-only from the app's perspective for this phase
— no create/update/delete endpoints. Corrections to names/flags happen via
direct DB update or a future seed re-run, not through the API.

## Organizations

| Method | Path                              | Purpose                                   |
|--------|-----------------------------------|----------------------------------------------|
| GET    | `/api/organizations`              | List organizations (search by name, filter by country) |
| POST   | `/api/organizations`              | Create an organization                       |
| GET    | `/api/organizations/:id`          | Get one organization, with its job applications |
| PATCH  | `/api/organizations/:id`          | Update name/country/website/notes            |
| DELETE | `/api/organizations/:id`          | Delete (only if it has no job applications)   |

## CVs

| Method | Path                    | Purpose                                        |
|--------|-------------------------|---------------------------------------------------|
| GET    | `/api/cvs`               | List CVs in the library                          |
| POST   | `/api/cvs`               | Upload a new CV (`multipart/form-data`: file + label + notes) |
| GET    | `/api/cvs/:id`           | Get CV metadata                                  |
| GET    | `/api/cvs/:id/file`      | Download/stream the actual CV file               |
| PATCH  | `/api/cvs/:id`           | Update label/notes (not the file itself)         |
| DELETE | `/api/cvs/:id`           | Delete (only if not referenced by any application) |

## Cover Letters

Mirrors the CV endpoints exactly — same shape, separate library.

| Method | Path                              | Purpose                                        |
|--------|------------------------------------|---------------------------------------------------|
| GET    | `/api/cover-letters`               | List cover letters in the library                |
| POST   | `/api/cover-letters`               | Upload a new cover letter (`multipart/form-data`) |
| GET    | `/api/cover-letters/:id`           | Get metadata                                     |
| GET    | `/api/cover-letters/:id/file`      | Download/stream the file                         |
| PATCH  | `/api/cover-letters/:id`           | Update label/notes                               |
| DELETE | `/api/cover-letters/:id`           | Delete (only if not referenced by any application) |

## Skills

| Method | Path              | Purpose                        |
|--------|-------------------|-----------------------------------|
| GET    | `/api/skills`     | List all skills (for autocomplete)|
| POST   | `/api/skills`     | Create a new skill                |

## Job Applications

| Method | Path                                   | Purpose                                              |
|--------|-----------------------------------------|---------------------------------------------------------|
| GET    | `/api/job-applications`                 | List, with filters: `organizationId`, `countryId`, `status`, date range, `needsFollowUp`, `isGhosted` |
| POST   | `/api/job-applications`                 | Create an application (also creates its first status-history row, "applied") |
| GET    | `/api/job-applications/:id`             | Get full detail: organization, cv, cover letter, country, contacts, skills, interview rounds, status history |
| PATCH  | `/api/job-applications/:id`             | Update title/URL/source/notes/cv/cover letter/country (not status — see below) |
| DELETE | `/api/job-applications/:id`             | Delete (cascades to its history, contacts, interview rounds, skill tags) |

List responses for `/api/job-applications` include the computed fields
`daysSinceLastUpdate`, `needsFollowUp`, and `isGhosted` per row (see
[01-domain-model.md](./01-domain-model.md#derived--computed-fields-not-stored))
so the UI can surface a "needs follow-up" view without a dedicated endpoint.

### Status history (sub-resource)

Status changes are modeled as their own endpoint rather than a `PATCH` on
`current_status`, because creating a history entry is the operation — not
overwriting a field.

| Method | Path                                                      | Purpose                          |
|--------|------------------------------------------------------------|-------------------------------------|
| GET    | `/api/job-applications/:id/status-history`                  | Full timeline for one application  |
| POST   | `/api/job-applications/:id/status-history`                  | Append a new status (updates `current_status` on the parent as a side effect) |

### Contacts (sub-resource)

| Method | Path                                              | Purpose                  |
|--------|-----------------------------------------------------|-----------------------------|
| GET    | `/api/job-applications/:id/contacts`                 | List contacts for an application |
| POST   | `/api/job-applications/:id/contacts`                 | Add a contact               |
| DELETE | `/api/job-applications/:id/contacts/:contactId`      | Remove a contact            |

### Interview rounds (sub-resource)

| Method | Path                                                    | Purpose                        |
|--------|--------------------------------------------------------|------------------------------------|
| GET    | `/api/job-applications/:id/interview-rounds`             | List rounds for an application     |
| POST   | `/api/job-applications/:id/interview-rounds`             | Add a round (type + scheduled date)|
| PATCH  | `/api/job-applications/:id/interview-rounds/:roundId`    | Update outcome/notes/date          |
| DELETE | `/api/job-applications/:id/interview-rounds/:roundId`    | Remove a round                     |

### Skill tags (sub-resource)

| Method | Path                                                    | Purpose                        |
|--------|------------------------------------------------------------|------------------------------------|
| GET    | `/api/job-applications/:id/skills`                          | List skills tagged on an application |
| POST   | `/api/job-applications/:id/skills`                          | Tag a skill (`{ skillId }`)          |
| DELETE | `/api/job-applications/:id/skills/:skillId`                 | Remove a tag                        |

## Conventions

- IDs in URLs are the numeric surrogate keys from the schema.
- List endpoints return plain arrays for now (pagination is not needed yet
  at personal-job-search volume; revisit if this ever becomes an issue).
- Errors return a JSON body `{ "error": "message" }` with an appropriate
  4xx/5xx status code. No error-code taxonomy needed yet — single consumer
  (your own UI), single user.
- No versioning prefix (`/api/v1/...`) — not warranted for a local,
  single-consumer tool; add it later only if it ever becomes necessary.
