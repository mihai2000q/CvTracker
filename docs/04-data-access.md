# Data Access: Queries, Actions and Route Handlers

CvTracker has no REST API. The UI and the data layer live in one Next.js
project, so the server is reached in three ways, each for a different job:

| Layer | Where | Used for |
|---|---|---|
| **Queries** | `src/features/<feature>/queries/*.ts` | Reading data, called from Server Components (and from route handlers) |
| **Actions** | `src/features/<feature>/actions/*.ts` (`'use server'`) | Every write, called from forms (`useActionState`) or event handlers |
| **Route handlers** | `src/app/api/**/route.ts` | The few things a query or action can't do: client-driven fetches, file responses, a cookie-clearing redirect |

Which one to use:

- Rendering a page or a part of one → a **query**, awaited in the Server Component.
- Creating, changing or deleting anything → an **action**.
- The browser must fetch by itself (infinite scroll, search-as-you-type), stream a
  file, or clear a cookie → a **route handler**, which is a thin wrapper that calls
  a query.

There is no `fetch('/api/...')` for mutations and no JSON API for pages to
call. Each feature owns its folder (`auth`, `countries`, `dashboard`,
`documents`, `job-applications`, `organizations`); each has its own `schemas/`
(zod), `types/`, `constants/` and, where needed, `services/`.

## Conventions shared by queries and actions

- **Authentication.** Every query and action starts with `verifySession()`
  and, when it needs the user, `getUserId(session)` (see
  [03-architecture.md](./03-architecture.md#authentication-flow)). None of them
  accept a `userId` from the caller: the current user always comes from the
  verified session (domain model rule 11). An unauthenticated caller is
  redirected to `/sign-in`, there is no `401`.
- **Ownership.** Queries filter by `userId` in the `where` clause, so another
  user's row is simply not found (`null`, or a "not found" error). Actions
  mostly don't: authorization is out of scope, see [Known gaps](#known-gaps).
- **Validation.** Input is parsed with zod (`zodValidate` for plain arguments,
  `zodValidateForm` for `FormData`, which uses Conform). Invalid input never
  reaches the database.
- **Return shapes.**
  - Form actions (`createX`, `updateX`, `scheduleInterview`, `signIn`, ...) take
    `(previousState, formData)` and return a Conform `SubmissionResult`: field
    errors and form errors travel in it, `resetForm: true` on success.
  - Non-form actions and queries that take arguments (`deleteX`,
    `changeJobApplicationStatus`, `getJobApplications`, ...) return
    `Result<T>` from `src/types/result.ts`: `{ success: true, data }` or
    `{ success: false, errors }`, where `errors` maps a field to its messages.
  - Database constraint violations (unique, foreign key, restrict) are turned
    into a field/form error by `constraintViolationReply` instead of surfacing
    as a thrown error. Anything unexpected is thrown and caught by the nearest
    `error.tsx`.
  - Sign-in, sign-up and sign-out end in `redirect()`.
- **Caching.** Queries are wrapped in `'use cache'` and tagged with
  `cacheTag(cacheTags.<entity>(userId))` (`src/lib/cache-tags.ts`: `documents`,
  `jobApplications`, `organizations`, and `contacts` per organization). Every
  action that writes calls `updateTag(...)` for the tags it affects, which is
  what makes the next read fresh. A new query must tag everything it reads; a
  new action must invalidate everything it writes.
- **Lists.** List queries are paginated by `page`/`pageSize` and return
  `{ items, totalCount }`, with `sortBy`, `filterBy` and `search` as inputs
  (`src/lib/pagination.ts`, `database/paginate.ts`, `database/sort.ts`,
  `database/filter.ts`). The page state lives in the URL search params. Feeds
  loaded by infinite scroll use a cursor instead and return
  `{ items, nextCursor }`.
- **IDs** are UUIDv7 strings, validated with `z.uuid()` before use.

## Authentication

Server Actions in `src/features/auth/`. On success `signUp` and `signIn` set the
`session` cookie (HTTP-only, `SameSite=Lax`) and redirect to `/dashboard`; a
successful signup signs the new user in immediately.

| Action | Purpose |
|---|---|
| `signUp(name, email, password)` | Creates a `User` with a hashed password. A duplicate email returns the form error "Email already in use." |
| `signIn(email, password)` | Verifies the credentials. Any mismatch returns the same "Invalid credentials." error, so it never reveals which emails are registered |
| `signOut()` | Deletes the cookie and redirects to `/sign-in` |

There is no endpoint that returns the current user. Server code calls
`getCurrentUser()` (`src/lib/auth/session.ts`, `id`, `name`, `email`, never
`passwordHash`) directly.

Route protection and token refresh are in `src/proxy.ts`; see
[03-architecture.md](./03-architecture.md#route-protection).

## Queries

### Countries

| Query | Purpose |
|---|---|
| `getCountries` / `countCountries` | Paginated, searchable list for the countries page, and its count |
| `getCountry` | One country |
| `getCountryOrganizations` | The organizations operating in a country (also served by a route handler) |
| `searchCountries` | Cursor-paginated search for dropdowns (also served by a route handler) |

Countries are seeded and read-only: there is no action that writes them.
Corrections happen by re-running `npm run db:seed`.

### Organizations

| Query | Purpose |
|---|---|
| `getOrganizations` / `countOrganizations` | Paginated list (search, filters, sort) and its count |
| `getOrganization` | One organization with its countries and job-application count |
| `getOrganizationContacts` | The contacts of an organization (also served by a route handler) |
| `getOrganizationFiltersMetadata` | Options for the list's filters |
| `searchOrganizations` | Cursor-paginated search for dropdowns (route handler) |

### Documents

| Query | Purpose |
|---|---|
| `getDocuments` / `countDocuments` | Paginated list, filterable by `type` (`cv` or `cover_letter`), and its count |
| `getDocument` | Metadata of one document and how many applications use it |
| `downloadDocument` | Reads the stored file; used by the download route handler |
| `searchDocuments` | Cursor-paginated search for dropdowns (route handler) |

### Job applications

| Query | Purpose |
|---|---|
| `getJobApplications` | Paginated list with organization, country, documents and interview rounds; filters, search and sort |
| `getJobApplication` | Full detail: the list data plus the status history |
| `getJobApplicationSummaries` | Lightweight paginated list for pickers (route handler) |
| `countJobApplications` / `countJobApplicationsByStatus` | Totals, and the per-status counts for the status tabs |
| `getJobApplicationFiltersMetadata` | Options for the list's filters |
| `getStaleJobApplications` | Applications in progress with no update for `GHOSTED_AFTER_MONTHS` (3), longest silent first |
| `exportJobApplicationsCsv` / `exportJobApplicationsExcel` | The user's applications as a file, used by the export route handler |

### Dashboard

| Query | Purpose |
|---|---|
| `getDashboardStats` | KPIs, applications over time, outcomes and the pipeline funnel for a period (`from`/`to` search params) |
| `getRecentActivity` | Cursor-paginated status changes (route handler) |
| `getUpcomingInterviews` | Cursor-paginated interview rounds still to take place (route handler) |

## Actions

### Organizations

| Action | Purpose |
|---|---|
| `createOrganization` | Creates an organization (`name`, `websiteUrl`, `notes`, `countryIds`) |
| `updateOrganization` | Updates it and **replaces** its `countryIds` as a whole |
| `deleteOrganization` | Deletes the organization **together with its job applications**; the database restricts the reverse, so the applications are deleted first |
| `createContact` / `updateContact` / `deleteContact` | Manage the contacts of an organization. Deleting a contact removes it from its interview rounds; the rounds stay |

`countryIds` is the organization's `OrganizationCountry` set. It is a plain
field on the create and update forms, not a sub-resource: each write replaces
the entire set. See
[01-domain-model.md](./01-domain-model.md#organizationcountry-join-table).

### Documents

| Action | Purpose |
|---|---|
| `createDocument` | Uploads a file (`multipart/form-data`) with `type`, `name`, `notes`, `skillIds`. The file is written to disk first and discarded if the row can't be created |
| `updateDocument` | Updates name and notes, optionally replaces the file (the old one is removed), and can change `type` only while no application uses the document |
| `deleteDocument` | Deletes the row and the stored file. Refused with an error while an application references it (foreign key restrict) |

A document's `type` can only change while no job application references it,
since an application holds it specifically as a CV or as a cover letter.

### Job applications

| Action | Purpose |
|---|---|
| `createJobApplication` | Creates the application **and its first status-history row** ("applied"). Can create the organization and upload the CV and cover letter in the same submission |
| `updateJobApplication` | Updates title, URL, source, notes, documents and country. Not the status |
| `deleteJobApplication` | Deletes it; its history and interview rounds go with it, the organization's contacts stay |
| `changeJobApplicationStatus` | Appends a status-history entry and updates `currentStatus`, in one transaction. Moving to `withdrawn` or `no_response` cancels the interview rounds still to come, `offer` and `rejected` settle them; the result reports what was affected |
| `markGhostedJobApplications` / `undoGhostedJobApplications` | Moves every stale application to `no_response` (shown as "Ghosted") and cancels its upcoming rounds; the result carries what the undo needs to put it all back |
| `scheduleInterview` | Adds an interview round with existing contacts and/or a new one. An application still `applied` or `screening` moves to `interview` in the same transaction |
| `updateInterviewRound` | Updates type, date and time, notes and contacts of a round (the outcome has its own action) |
| `setInterviewOutcome` | Sets a round's outcome. A failed round rejects an application in progress, unless another round is still to come, in which case the result only says so |
| `deleteInterviewRound` | Removes a round |

Status changes are their own action and not part of `updateJobApplication`,
because creating a history entry is the operation, not overwriting a field.

Skill tags follow the same full-replace rule as `countryIds`: `skillIds` is
sent when creating or updating an application or a document and replaces the
set in one write (see [Limitations](#limitations)).

## Route handlers

`src/app/api/` has eleven `GET` handlers. Each parses the URL, calls the matching
query, and answers `400 { errors }` on invalid input. They exist only because
a Server Component can't serve them:

| Path | Why it is a route handler | Calls |
|---|---|---|
| `/api/countries/search` | Client-side dropdown search | `searchCountries` |
| `/api/countries/[id]/organizations` | Infinite scroll on the country page | `getCountryOrganizations` |
| `/api/organizations/search` | Client-side dropdown search | `searchOrganizations` |
| `/api/organizations/[id]/contacts` | Loaded when an organization is picked in a form | `getOrganizationContacts` |
| `/api/documents/search` | Client-side dropdown search | `searchDocuments` |
| `/api/documents/[id]/download` | Streams the file; `?inline=1` displays it instead of downloading | `downloadDocument` |
| `/api/job-applications/summaries` | Paged fetching for pickers | `getJobApplicationSummaries` |
| `/api/job-applications/export` | `?format=csv\|xlsx`, answers with a file | `exportJobApplications*` |
| `/api/dashboard/recent-activity` | Infinite scroll on the dashboard | `getRecentActivity` |
| `/api/dashboard/upcoming-interviews` | Infinite scroll on the dashboard | `getUpcomingInterviews` |
| `/api/session/clear` | Deletes the session cookie and redirects to `/sign-in`; reached when a valid token belongs to a deleted user (a Server Component can't write cookies) | none |

Two things are different from pages and actions:

- `src/proxy.ts` excludes `api/` from its matcher, so these handlers are
  **not** gated or refreshed by it. Each one is protected by the
  `verifySession()` inside the query it calls (the session-clear route needs
  none).
- Errors use `{ errors }` (a field map), except export, which uses
  `{ error: "message" }` for an unknown format.

The client calls them through `src/lib/http/fetch-json.ts` with TanStack Query
(`src/lib/query-keys.ts`).

## Limitations

- **Skills have no management of their own.** There is no query and no action
  to list, create, rename or delete a skill. Skills exist in the schema, and
  `skillIds` is accepted when creating or updating a document or an application,
  but nothing in the app creates a `Skill` row yet, so the tags can only be
  populated from the sample data. Domain rule 6 (tagging with a skill that
  doesn't exist creates it) is not implemented.
- **No account features beyond sign-up, sign-in and sign-out.** No password
  reset, email verification, profile update or account deletion.
- **No server-side revocation.** The session is a stateless JWT; sign-out only
  clears the cookie.
- **No versioning, no public API.** The routes above are an implementation
  detail of the UI, not a contract for other consumers.

## Known gaps

**Authorization is out of scope.** The app authenticates (who you are) but
does not fully authorize (what you may touch). Ownership (domain rule 9) is
enforced by the read queries, which filter by `userId`. It is **not**
enforced on writes, and the app does not defend against a signed-in user
supplying identifiers that belong to someone else:

- Several actions and the download query look a row up by `id` only (for
  example `deleteJobApplication`, `deleteDocument`, `deleteContact`,
  `updateDocument`, `updateOrganization`, `createContact`, `scheduleInterview`,
  `downloadDocument`). A signed-in user who knew another user's id could act
  on that row.
- Foreign ids in a payload (`organizationId`, `cvDocumentId`,
  `coverLetterDocumentId`, `countryIds`, `contactIds`, `skillIds`) are not
  checked to belong to the current user. An application can be created
  pointing at another user's organization or document.
- There are no roles or permissions, and no check beyond "has a valid
  session".

This is a deliberate scope decision for a personal, local-only tool whose ids
are unguessable UUIDv7 values and which has no sharing between users. It would
have to be closed (add `userId` to those `where` clauses and verify every
foreign id) before the app is exposed to users who don't trust each other.
