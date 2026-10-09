# API Design

All endpoints are Next.js Route Handlers under `app/api/**`, returning JSON
(`multipart/form-data` for the document upload endpoint). Every endpoint
except signup, sign-in, and `GET /api/countries` requires authentication —
see below.

This is the conceptual surface — request/response field shapes will be
refined during implementation, but the resources and verbs below are meant
to be stable, since they map directly to the domain model.

## Authentication

Signup and sign-in are the only endpoints that don't require an existing
session. Both, on success, set the same HTTP-only session cookie described
in [03-architecture.md](./03-architecture.md#authentication-flow) — a
successful signup signs the new user in immediately, no separate sign-in
step needed.

| Method | Path                  | Purpose                                                        |
|--------|-----------------------|--------------------------------------------------------------------|
| POST   | `/api/auth/signup`    | Create a `User` (`name`, `email`, `password`); sets the session cookie |
| POST   | `/api/auth/signin`    | Verify `email` + `password`; sets the session cookie             |
| POST   | `/api/auth/logout`    | Clear the session cookie                                          |
| GET    | `/api/auth/me`        | Return the current authenticated user (`id`, `name`, `email` — never `password_hash`) |

- `signup` returns `409` if the email is already registered.
- `signin` returns `401` on any mismatch (wrong email or wrong password) —
  never distinguishing which, to avoid leaking which emails are registered.
- Every other endpoint below returns `401` if the session cookie is
  missing, invalid, or expired. None of them accept or expose a `userId`
  field — the current user is always resolved from the verified session,
  never from client input (see domain model rule 11).

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
| GET    | `/api/organizations/:id`          | Get one organization, with its job applications and `countryIds` |
| PATCH  | `/api/organizations/:id`          | Update name/country/websiteUrl/notes/`countryIds` |
| DELETE | `/api/organizations/:id`          | Delete (only if it has no job applications)   |

`countryIds` (an array) is the organization's `OrganizationCountry`
set — the countries it's known to operate in, beyond its primary
`countryId`. It's a plain field on the create/update payload, **not** a
separate sub-resource: `POST`/`PATCH` write the entire set at once (full
replace on `PATCH`, not incremental add/remove), and `GET` includes it in
the response. See
[01-domain-model.md](./01-domain-model.md#organizationcountry-join-table)
for why it's modeled this way instead of dedicated add/remove endpoints.

## Documents

CVs and cover letters share one library and one grid in the UI, so they
share one resource here too — `type` filters/selects between them
rather than splitting into separate endpoints.

| Method | Path                       | Purpose                                                     |
|--------|----------------------------|------------------------------------------------------------------|
| GET    | `/api/documents`            | List documents (optional `?type=cv\|cover_letter` filter) |
| POST   | `/api/documents`            | Upload a new document (`multipart/form-data`: file + `type` + name + notes) |
| GET    | `/api/documents/:id`        | Get document metadata                                        |
| GET    | `/api/documents/:id/file`   | Download/stream the actual file                               |
| PATCH  | `/api/documents/:id`        | Update name/notes (not the file or its type)                 |
| DELETE | `/api/documents/:id`        | Delete (only if not referenced by any application)             |

`type` is immutable after upload — swapping a document from `cv` to
`cover_letter` isn't an update, it's a new upload.

## Skills

| Method | Path              | Purpose                        |
|--------|-------------------|-----------------------------------|
| GET    | `/api/skills`     | List all skills (for autocomplete)|
| POST   | `/api/skills`     | Create a new skill                |

## Job Applications

| Method | Path                                   | Purpose                                              |
|--------|-----------------------------------------|---------------------------------------------------------|
| GET    | `/api/job-applications`                 | List, with filters: `organizationId`, `countryId`, `status`, date range, `needsFollowUp`, `isGhosted` |
| POST   | `/api/job-applications`                 | Create an application (`countryId` may be any country — see note below; also creates its first status-history row, "applied") |
| GET    | `/api/job-applications/:id`             | Get full detail: organization, cv document, cover letter document, country, contacts, skills, interview rounds, status history |
| PATCH  | `/api/job-applications/:id`             | Update title/URL/source/notes/cv document/cover letter document/country (not status — see below) |
| DELETE | `/api/job-applications/:id`             | Delete (cascades to its history, contacts, interview rounds, skill tags) |

List responses for `/api/job-applications` include the computed fields
`daysSinceLastUpdate`, `needsFollowUp`, and `isGhosted` per row (see
[01-domain-model.md](./01-domain-model.md#derived--computed-fields-not-stored))
so the UI can surface a "needs follow-up" view without a dedicated endpoint.

**Country filtering is client-side only.** When building the "new job
application" form for a given organization, the UI fetches that
organization's `countryIds` (from `GET /api/organizations/:id`) to narrow
the country dropdown to places it's known to operate — but `countryId` here
accepts any country; the server never validates it against the
organization's set (domain model rule 12).

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

### Skill tags

Backed by the `job_application_has_skill` and `document_has_skill` join
tables (see [02-database-schema.md](./02-database-schema.md)). There are no
sub-resource endpoints: like `Organization.countryIds` above, `skillIds` is
sent when creating or updating a job application or a document, and
replaces the full set in one write.

## Conventions

- IDs in URLs are the numeric surrogate keys from the schema.
- List endpoints return plain arrays for now (pagination is not needed yet
  at personal-job-search volume; revisit if this ever becomes an issue).
- Errors return a JSON body `{ "error": "message" }` with an appropriate
  4xx/5xx status code. No error-code taxonomy needed yet — single consumer
  (your own UI).
- `401` means "no valid session" (see Authentication above); `403` is not
  used anywhere in this phase since there are no roles/permissions beyond
  plain ownership, and a request for another user's resource should return
  `404`, not `403` — it shouldn't confirm the resource exists at all.
- No versioning prefix (`/api/v1/...`) — not warranted for a local,
  single-consumer tool; add it later only if it ever becomes necessary.
