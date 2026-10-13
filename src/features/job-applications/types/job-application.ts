import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { CountrySummary } from '@/features/countries/types/country.ts';
import { OrganizationSummary } from '@/features/organizations/types/organization.ts';
import { DocumentSummary } from '@/features/documents/types/document.ts';
import { InterviewRound } from '@/features/job-applications/types/interview-round.ts';

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
