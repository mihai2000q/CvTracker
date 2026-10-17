import { z } from 'zod';
import { pagePaginationSchema } from '@/schemas/page-pagination-schema.ts';
import { sortSchema } from '@/schemas/sort-schema.ts';
import { JOB_APPLICATION_SORT_FIELDS } from '@/features/job-applications/constants/job-application-sorting.ts';

export const getJobApplicationSummariesQuerySchema = pagePaginationSchema
  .extend({
    countryId: z.uuid().optional(),
    documentId: z.uuid().optional(),
    organizationId: z.uuid().optional(),
    sortBy: sortSchema(JOB_APPLICATION_SORT_FIELDS),
  })
  .refine(
    ({ countryId, documentId, organizationId }) => countryId || documentId || organizationId,
    {
      message: 'A country, a document or an organization is required',
    }
  );

export type GetJobApplicationSummariesQueryInput = z.input<
  typeof getJobApplicationSummariesQuerySchema
>;
export type GetJobApplicationSummariesQuery = z.output<
  typeof getJobApplicationSummariesQuerySchema
>;
