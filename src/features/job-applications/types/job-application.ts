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

export interface StatusChange {
  id: string;
  status: JobApplicationStatus;
  note: string | null;
  // An exact instant (ISO)
  changedAt: string;
}

export interface JobApplicationDetail extends JobApplication {
  statusHistory: StatusChange[];
}

export const toStatusChange = (
  row: Omit<StatusChange, 'status'> & { status: string }
): StatusChange => ({
  id: row.id,
  status: row.status as JobApplicationStatus,
  note: row.note,
  changedAt: row.changedAt,
});

// An application in progress that has gone silent long enough to be taken as ghosted
export interface StaleJobApplication extends Pick<
  JobApplication,
  'id' | 'title' | 'currentStatus' | 'country'
> {
  organization: Pick<OrganizationSummary, 'id' | 'name'>;
  // The day of its last status change, or the day it was applied to when it never changed
  lastUpdate: string;
}
