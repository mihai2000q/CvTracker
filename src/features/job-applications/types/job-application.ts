import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { CountrySummary } from '@/features/countries/types/country.ts';
import { OrganizationSummary } from '@/features/organizations/types/organization.ts';
import { DocumentSummary } from '@/features/documents/types/document.ts';
import { InterviewRound } from '@/features/job-applications/types/interview-round.ts';

export interface JobApplication extends JobApplicationSummary {
  postingUrl?: string | null;
  source?: string | null;
  notes?: string | null;
  country: CountrySummary;
  organization: OrganizationSummary;
  cv: DocumentSummary;
  coverLetter?: DocumentSummary | null;
  interviewRounds: InterviewRound[];
}

export interface JobApplicationSummary {
  id: string;
  title: string;
  currentStatus: JobApplicationStatus;
  appliedAt: string;
}
