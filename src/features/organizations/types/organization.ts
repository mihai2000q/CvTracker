import { CountrySummary } from '@/features/countries/types/country.ts';
import { OrganizationJobApplication } from '@/features/organizations/types/organization-job-application.ts';

export interface Organization {
  id: string;
  name: string;
  countries: CountrySummary[];
  websiteUrl: string | null;
  notes: string | null;
  jobApplications: OrganizationJobApplication[];
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

export interface OrganizationDetail extends OrganizationSummary {
  websiteUrl: string | null;
  notes: string | null;
  jobApplicationsCount: number;
}
