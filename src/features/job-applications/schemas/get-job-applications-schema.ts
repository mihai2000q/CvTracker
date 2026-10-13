import { z } from 'zod';
import { pagePaginationSchema } from '@/schemas/page-pagination-schema.ts';
import { sortSchema } from '@/schemas/sort-schema.ts';
import { JOB_APPLICATION_SORT_FIELDS } from '@/features/job-applications/constants/job-application-sorting.ts';

export const getJobApplicationsQuerySchema = pagePaginationSchema.extend({
  sortBy: sortSchema(JOB_APPLICATION_SORT_FIELDS),
});

export type GetJobApplicationsQueryInput = z.input<typeof getJobApplicationsQuerySchema>;
export type GetJobApplicationsQuery = z.output<typeof getJobApplicationsQuerySchema>;
