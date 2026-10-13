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
  [JobApplicationStatus.Withdrawn]: { label: 'Withdrawn', count: 12 },
  [JobApplicationStatus.Rejected]: { label: 'Rejected', count: 12 },
  [JobApplicationStatus.NoResponse]: { label: 'Ghosted', count: 12 },
};

// How far along an application is, what sorting by status ranks by: the pipeline first, then
// the ways it closes, in the order of the tabs
export const JOB_APPLICATION_STATUS_ORDER: readonly JobApplicationStatus[] = [
  JobApplicationStatus.Applied,
  JobApplicationStatus.Screening,
  JobApplicationStatus.Interview,
  JobApplicationStatus.Offer,
  JobApplicationStatus.Withdrawn,
  JobApplicationStatus.Rejected,
  JobApplicationStatus.NoResponse,
];

// Scheduling an interview moves an application in one of these to Interview. Anywhere else
// (already interviewing, an offer, or closed by a rejection, a withdrawal or silence) the
// status is a decision of its own and stays
export const STATUSES_BEFORE_INTERVIEW: readonly string[] = [
  JobApplicationStatus.Applied,
  JobApplicationStatus.Screening,
];
