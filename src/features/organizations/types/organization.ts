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

type OrganizationRow = Omit<OrganizationSummary, 'countries'> & {
  organizationCountries: { country: CountrySummary }[];
};

export const toOrganizationSummary = (row: OrganizationRow): OrganizationSummary => ({
  id: row.id,
  name: row.name,
  countries: row.organizationCountries.map(({ country }) => country),
});
