import {
  RiBriefcase2Line,
  RiBriefcaseLine,
  RiHistoryLine,
  RiPulseLine,
  RiSortAlphabetAsc,
  RiTimeLine,
} from '@remixicon/react';
import type { SortPreset } from '@/lib/sort.ts';
import type { OrganizationSortField } from '@/features/organizations/constants/organization-sorting.tsx';
import { DEFAULT_COUNTRY_ORGANIZATION_SORT_BY } from '@/features/countries/constants/country-page.ts';

// The orders of the organizations in a country. The applications are counted in all of the
// countries of an organization, as the organizations page counts them.
export const COUNTRY_ORGANIZATION_SORT_PRESETS: SortPreset<OrganizationSortField>[] = [
  {
    label: 'Alphabetically',
    icon: <RiSortAlphabetAsc />,
    sortBy: DEFAULT_COUNTRY_ORGANIZATION_SORT_BY,
  },
  {
    label: 'Last activity',
    icon: <RiPulseLine />,
    sortBy: [{ field: 'lastActivityAt', direction: 'desc' }],
  },
  {
    label: 'Most applications',
    icon: <RiBriefcaseLine />,
    sortBy: [{ field: 'jobApplications', direction: 'desc' }],
  },
  {
    label: 'Least applications',
    icon: <RiBriefcase2Line />,
    sortBy: [{ field: 'jobApplications', direction: 'asc' }],
  },
  {
    label: 'Newest',
    icon: <RiTimeLine />,
    sortBy: [{ field: 'createdAt', direction: 'desc' }],
  },
  {
    label: 'Oldest',
    icon: <RiHistoryLine />,
    sortBy: [{ field: 'createdAt', direction: 'asc' }],
  },
];
