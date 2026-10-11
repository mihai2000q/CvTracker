import { CountrySummary } from '@/features/countries/types/country.ts';
import { JobApplicationSummary } from '@/features/job-applications/types/job-application.ts';

export interface Organization extends OrganizationSummary {
  websiteUrl: string | null;
  notes: string | null;
  jobApplications: JobApplicationSummary[];
  lastActivityAt: string;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  countries: CountrySummary[];
}
