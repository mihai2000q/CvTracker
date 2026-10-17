import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { CountrySummary } from '@/features/countries/types/country.ts';
import { DocumentSummary, toDocumentSummary } from '@/features/documents/types/document.ts';
import {
  InterviewRound,
  toInterviewRound,
} from '@/features/job-applications/types/interview-round.ts';

// An application as its organization shows it: the organization is the one it is under
export interface OrganizationJobApplication {
  id: string;
  title: string;
  currentStatus: JobApplicationStatus;
  appliedAt: string;
  source?: string | null;
  postingUrl?: string | null;
  country: CountrySummary;
  cv: DocumentSummary;
  interviewRounds: InterviewRound[];
}

type OrganizationJobApplicationRow = Pick<
  OrganizationJobApplication,
  'id' | 'title' | 'source' | 'postingUrl' | 'country'
> & {
  currentStatus: string;
  appliedAt: { toString(): string };
  cvDocument: Parameters<typeof toDocumentSummary>[0];
  interviewRounds: Parameters<typeof toInterviewRound>[0][];
};

export const toOrganizationJobApplication = (
  row: OrganizationJobApplicationRow
): OrganizationJobApplication => ({
  id: row.id,
  title: row.title,
  currentStatus: row.currentStatus as JobApplicationStatus,
  appliedAt: row.appliedAt.toString(),
  source: row.source,
  postingUrl: row.postingUrl,
  country: { id: row.country.id, name: row.country.name, isoCode: row.country.isoCode },
  cv: toDocumentSummary(row.cvDocument),
  interviewRounds: row.interviewRounds.map(toInterviewRound),
});
