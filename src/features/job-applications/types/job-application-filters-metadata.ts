import { CountrySummary } from '@/features/countries/types/country.ts';

export interface JobApplicationFiltersMetadata {
  organizations: { id: string; name: string }[];
  countries: CountrySummary[];
  cvs: { id: string; name: string }[];
}
