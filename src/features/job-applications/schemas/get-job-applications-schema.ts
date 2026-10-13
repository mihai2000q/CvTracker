import { z } from 'zod';
import { pagePaginationSchema } from '@/schemas/page-pagination-schema.ts';
import { filterSchema } from '@/schemas/filter-schema.ts';
import { JOB_APPLICATION_FILTERS } from '@/features/job-applications/constants/job-application-filtering.ts';
import { sortSchema } from '@/schemas/sort-schema.ts';
import { JOB_APPLICATION_SORT_FIELDS } from '@/features/job-applications/constants/job-application-sorting.ts';

export const getJobApplicationsQuerySchema = pagePaginationSchema.extend({
  sortBy: sortSchema(JOB_APPLICATION_SORT_FIELDS),
  filterBy: filterSchema(JOB_APPLICATION_FILTERS),
  search: z.string().trim().max(100).optional(),
});

export type GetJobApplicationsQueryInput = z.input<typeof getJobApplicationsQuerySchema>;
export type GetJobApplicationsQuery = z.output<typeof getJobApplicationsQuerySchema>;
