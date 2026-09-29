import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { CountrySummary } from '@/features/countries/types/country.ts';
import { OrganizationSummary } from '@/features/organizations/types/organization.ts';
import { DocumentSummary } from '@/features/documents/types/document.ts';

export interface JobApplication extends JobApplicationSummary {
  postingUrl?: string;
  source?: string;
  notes?: string;
  country: CountrySummary;
  organization: OrganizationSummary;
  cvDocument: DocumentSummary;
  coverLetter: DocumentSummary;
}

export interface JobApplicationSummary {
  id: string;
  title: string;
  currentStatus: JobApplicationStatus;
  appliedAt: string;
}
