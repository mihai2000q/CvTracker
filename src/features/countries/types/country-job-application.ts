import type { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import type { InterviewRound } from '@/features/job-applications/types/interview-round.ts';

export interface CountryJobApplication {
  id: string;
  title: string;
  currentStatus: JobApplicationStatus;
  appliedAt: string;
  postingUrl: string | null;
  organization: { id: string; name: string };
  interviewRounds: InterviewRound[];
}
