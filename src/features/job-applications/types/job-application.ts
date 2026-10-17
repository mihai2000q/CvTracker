import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { CountrySummary } from '@/features/countries/types/country.ts';
import { OrganizationSummary } from '@/features/organizations/types/organization.ts';
import { DocumentSummary, toDocumentSummary } from '@/features/documents/types/document.ts';
import {
  InterviewRound,
  toInterviewRound,
} from '@/features/job-applications/types/interview-round.ts';

export interface JobApplication {
  id: string;
  title: string;
  currentStatus: JobApplicationStatus;
  appliedAt: string;
  source?: string | null;
  postingUrl?: string | null;
  notes?: string | null;
  organization: OrganizationSummary;
  country: CountrySummary;
  cv: DocumentSummary;
  coverLetter?: DocumentSummary | null;
  interviewRounds: InterviewRound[];
}

type JobApplicationRow = Pick<
  JobApplication,
  'id' | 'title' | 'source' | 'postingUrl' | 'notes' | 'country'
> & {
  currentStatus: string;
  appliedAt: { toString(): string };
  cvDocument: Parameters<typeof toDocumentSummary>[0];
  coverLetterDocument?: Parameters<typeof toDocumentSummary>[0] | null;
  interviewRounds: Parameters<typeof toInterviewRound>[0][];
};

export const toJobApplication = (
  row: JobApplicationRow,
  organization: OrganizationSummary
): JobApplication => ({
  id: row.id,
  title: row.title,
  currentStatus: row.currentStatus as JobApplicationStatus,
  appliedAt: row.appliedAt.toString(),
  source: row.source,
  postingUrl: row.postingUrl,
  notes: row.notes,
  organization,
  country: { id: row.country.id, name: row.country.name, isoCode: row.country.isoCode },
  cv: toDocumentSummary(row.cvDocument),
  coverLetter: row.coverLetterDocument ? toDocumentSummary(row.coverLetterDocument) : undefined,
  interviewRounds: row.interviewRounds.map(toInterviewRound),
});

// Only an application in the interview stage has rounds worth showing
export const isInterviewing = ({
  currentStatus,
  interviewRounds,
}: {
  currentStatus: JobApplicationStatus;
  interviewRounds: InterviewRound[];
}) => currentStatus === JobApplicationStatus.Interview && interviewRounds.length > 0;
