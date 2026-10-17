import {
  RiBuildingLine,
  RiCalendarEventLine,
  RiSortAlphabetAsc,
  RiSortAsc,
  RiSortDesc,
  RiToggleLine,
} from '@remixicon/react';
import type { SortPreset } from '@/lib/sort.ts';
import {
  DEFAULT_JOB_APPLICATION_SORT_BY,
  type JobApplicationSortField,
} from '@/features/job-applications/constants/job-application-sorting.ts';

// The orders of the job applications sent to a country
export const COUNTRY_JOB_APPLICATION_SORT_PRESETS: SortPreset<JobApplicationSortField>[] = [
  { label: 'Recently applied', icon: <RiSortDesc />, sortBy: DEFAULT_JOB_APPLICATION_SORT_BY },
  {
    label: 'Earliest applied',
    icon: <RiSortAsc />,
    sortBy: [{ field: 'appliedAt', direction: 'asc' }],
  },
  {
    label: 'Alphabetically',
    icon: <RiSortAlphabetAsc />,
    sortBy: [{ field: 'title', direction: 'asc' }],
  },
  {
    label: 'By status',
    icon: <RiToggleLine />,
    sortBy: [{ field: 'status', direction: 'asc' }],
  },
  {
    label: 'By organization',
    icon: <RiBuildingLine />,
    sortBy: [{ field: 'organization', direction: 'asc' }],
  },
  {
    label: 'Next interview',
    icon: <RiCalendarEventLine />,
    sortBy: [{ field: 'nextInterview', direction: 'asc' }],
  },
];
