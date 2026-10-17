import type { SortEntry } from '@/lib/sort.ts';
import type { OrganizationSortField } from '@/features/organizations/constants/organization-sorting.tsx';

export const COUNTRY_ORGANIZATIONS_PAGE_SIZE = 10;
export const COUNTRY_JOB_APPLICATIONS_PAGE_SIZE = 20;

// Alphabetical, where the organizations of the page are listed before another order is picked
export const DEFAULT_COUNTRY_ORGANIZATION_SORT_BY: SortEntry<OrganizationSortField>[] = [
  { field: 'name', direction: 'asc' },
];
