# CvTracker

A personal tracker of every job application sent: which organization, which country, which exact CV and cover letter went out, and what happened afterwards.

## Language

**JobApplication**:
One application sent to an organization for one position, with the CV and optional cover letter that were sent.
_Avoid_: Job, role, posting

**Organization**:
An employer applied to. One organization has many JobApplications over time.
_Avoid_: Company, employer

**Contact**:
A person at an organization, such as a recruiter or an interviewer. Belongs to the organization, not to one JobApplication.

**Document**:
A file in the user's library: either a CV or a cover letter. Reused across JobApplications.
_Avoid_: File, resume. "Resume" is only accepted as part of the label "CV / Resume", where it accompanies "CV"

**Skill**:
A tag for a technology or competency, attached to Documents and JobApplications.

**Country**:
Reference data. A JobApplication has one (where the position is based); an Organization has a set of countries it operates in.

## Status

**Status**:
Where a JobApplication stands: Applied, Screening, Interview, Offer, Rejected, Withdrawn or Ghosted.

**Status history**:
The append-only timeline of Status changes of a JobApplication, each with a date and optional note.

**In progress**:
A JobApplication whose Status is Applied, Screening or Interview.

**Ghosted**:
The Status of a JobApplication the organization stopped answering. Set by hand or in bulk from the stale ones; the two are the same thing.
_Avoid_: No response

**Stale**:
An in-progress JobApplication with no update for three months. Not a Status: it only makes the JobApplication eligible to be marked Ghosted.

## Interviews

**InterviewRound**:
One scheduled step of the interview process of a JobApplication, of a given type, with the contacts taking part.
_Avoid_: Round, interview (for the step)

**InterviewOutcome**:
How an InterviewRound went: Scheduled, Passed, Failed or Cancelled.
_Avoid_: Outcome, result

**Upcoming**:
An InterviewRound that is Scheduled and still in the future.

## Relationships

- An **Organization** has many **JobApplications** and many **Contacts**.
- A **JobApplication** sends one **Document** as CV and may send one as cover letter.
- A **JobApplication** has a **Status history** and many **InterviewRounds**.
- Failing an **InterviewRound**, or moving a **JobApplication** to a **Status**, can change the other: see rule 8 in `docs/01-domain-model.md`.
