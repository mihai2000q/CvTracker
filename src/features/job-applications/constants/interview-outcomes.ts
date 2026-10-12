import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';

export const INTERVIEW_OUTCOME_LABELS: Record<InterviewOutcome, string> = {
  [InterviewOutcome.Scheduled]: 'Scheduled',
  [InterviewOutcome.Passed]: 'Passed',
  [InterviewOutcome.Failed]: 'Failed',
  [InterviewOutcome.Cancelled]: 'Cancelled',
};
