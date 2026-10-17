import type { CountrySummary } from '@/features/countries/types/country.ts';
import type { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import {
  InterviewRound,
  toInterviewRound,
} from '@/features/job-applications/types/interview-round.ts';

// An application as an item in a list under something else (a country, a document): enough to
// recognise it, its organization included
export interface JobApplicationSummary {
  id: string;
  title: string;
  currentStatus: JobApplicationStatus;
  appliedAt: string;
  postingUrl: string | null;
  organization: { id: string; name: string };
  country: CountrySummary;
  interviewRounds: InterviewRound[];
}

type JobApplicationSummaryRow = Pick<JobApplicationSummary, 'id' | 'title' | 'postingUrl'> & {
  currentStatus: string;
  appliedAt: { toString(): string };
  organization: { id: string; name: string } | null;
  country: CountrySummary | null;
  interviewRounds: Parameters<typeof toInterviewRound>[0][];
};

export const toJobApplicationSummary = (row: JobApplicationSummaryRow): JobApplicationSummary => ({
  id: row.id,
  title: row.title,
  currentStatus: row.currentStatus as JobApplicationStatus,
  appliedAt: row.appliedAt.toString(),
  postingUrl: row.postingUrl,
  organization: { id: row.organization!.id, name: row.organization!.name },
  country: { id: row.country!.id, name: row.country!.name, isoCode: row.country!.isoCode },
  interviewRounds: row.interviewRounds.map(toInterviewRound),
});
