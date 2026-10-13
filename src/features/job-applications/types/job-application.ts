import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { CountrySummary } from '@/features/countries/types/country.ts';
import { OrganizationSummary } from '@/features/organizations/types/organization.ts';
import { DocumentSummary, toDocumentSummary } from '@/features/documents/types/document.ts';
import {
  InterviewRound,
  toInterviewRound,
} from '@/features/job-applications/types/interview-round.ts';

export interface JobApplicationSummary {
  id: string;
  title: string;
  currentStatus: JobApplicationStatus;
  appliedAt: string;
  source?: string | null;
  postingUrl?: string | null;
  organization: OrganizationSummary;
  country: CountrySummary;
  cv: DocumentSummary;
  interviewRounds: InterviewRound[];
}

export interface JobApplication extends JobApplicationSummary {
  notes?: string | null;
  coverLetter?: DocumentSummary | null;
}

export type JobApplicationRow = Omit<
  JobApplicationSummary,
  'currentStatus' | 'appliedAt' | 'organization' | 'cv' | 'interviewRounds'
> & {
  currentStatus: string;
  appliedAt: { toString(): string };
  cvDocument: Parameters<typeof toDocumentSummary>[0];
  interviewRounds: Parameters<typeof toInterviewRound>[0][];
};

// The organization is passed in because every page loads it its own way: as the parent of
// the rows, or as a relation of each of them
export const toJobApplicationSummary = (
  row: JobApplicationRow,
  organization: OrganizationSummary
): JobApplicationSummary => ({
  id: row.id,
  title: row.title,
  currentStatus: row.currentStatus as JobApplicationStatus,
  appliedAt: row.appliedAt.toString(),
  source: row.source,
  postingUrl: row.postingUrl,
  organization,
  country: { id: row.country.id, name: row.country.name, isoCode: row.country.isoCode },
  cv: toDocumentSummary(row.cvDocument),
  interviewRounds: row.interviewRounds.map(toInterviewRound),
});

// Only an application in the interview stage has rounds worth showing
export const isInterviewing = ({
  currentStatus,
  interviewRounds,
}: Pick<JobApplicationSummary, 'currentStatus' | 'interviewRounds'>) =>
  currentStatus === JobApplicationStatus.Interview && interviewRounds.length > 0;
