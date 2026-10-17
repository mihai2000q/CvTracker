import 'server-only';
import { ApplicationStatus } from '@database/enums.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

// The statuses as the model has them, for what writes one. It stays out of the enum's own file
// because that one is imported by client components, and the model's enums would come with it
export const MODEL_APPLICATION_STATUSES = {
  [JobApplicationStatus.Applied]: ApplicationStatus.members.Applied,
  [JobApplicationStatus.Screening]: ApplicationStatus.members.Screening,
  [JobApplicationStatus.Interview]: ApplicationStatus.members.Interview,
  [JobApplicationStatus.Offer]: ApplicationStatus.members.Offer,
  [JobApplicationStatus.Rejected]: ApplicationStatus.members.Rejected,
  [JobApplicationStatus.Withdrawn]: ApplicationStatus.members.Withdrawn,
  [JobApplicationStatus.NoResponse]: ApplicationStatus.members.NoResponse,
};
