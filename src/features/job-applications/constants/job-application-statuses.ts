import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

interface StatusDetails {
  label: string;
  // TODO: placeholder until the counts come from a query
  count: number;
}

export const JOB_APPLICATION_STATUSES: Record<JobApplicationStatus, StatusDetails> = {
  [JobApplicationStatus.Applied]: { label: 'Applied', count: 12 },
  [JobApplicationStatus.Screening]: { label: 'Screening', count: 12 },
  [JobApplicationStatus.Interview]: { label: 'Interview', count: 12 },
  [JobApplicationStatus.Offer]: { label: 'Offer', count: 12 },
  [JobApplicationStatus.Rejected]: { label: 'Rejected', count: 12 },
  [JobApplicationStatus.Withdrawn]: { label: 'Withdrawn', count: 12 },
  [JobApplicationStatus.NoResponse]: { label: 'Ghosted', count: 12 },
};

// For a status that comes in as a plain string. Nothing for anything that isn't one
export const getJobApplicationStatus = (value: string): StatusDetails | undefined =>
  Object.hasOwn(JOB_APPLICATION_STATUSES, value)
    ? JOB_APPLICATION_STATUSES[value as JobApplicationStatus]
    : undefined;

// Scheduling an interview moves an application that hasn't reached the interview stage yet.
// Anywhere else (already interviewing, an offer, or closed by a rejection, a withdrawal or
// silence) the status is a decision of its own and stays
export const shouldMoveToInterview = (status: string) =>
  status === JobApplicationStatus.Applied || status === JobApplicationStatus.Screening;
