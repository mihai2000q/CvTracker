import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

export const JOB_APPLICATION_STATUSES: Record<JobApplicationStatus, string> = {
  [JobApplicationStatus.Applied]: 'Applied',
  [JobApplicationStatus.Screening]: 'Screening',
  [JobApplicationStatus.Interview]: 'Interview',
  [JobApplicationStatus.Offer]: 'Offer',
  [JobApplicationStatus.Withdrawn]: 'Withdrawn',
  [JobApplicationStatus.Rejected]: 'Rejected',
  [JobApplicationStatus.NoResponse]: 'Ghosted',
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
