import { z } from 'zod';
import { pagePaginationSchema } from '@/schemas/page-pagination-schema.ts';

export const getJobApplicationSummariesQuerySchema = pagePaginationSchema
  .extend({
    countryId: z.uuid().optional(),
    documentId: z.uuid().optional(),
    organizationId: z.uuid().optional(),
  })
  .refine(({ countryId, documentId, organizationId }) => countryId || documentId || organizationId, {
    message: 'A country, a document or an organization is required',
  });

export type GetJobApplicationSummariesQueryInput = z.input<
  typeof getJobApplicationSummariesQuerySchema
>;
export type GetJobApplicationSummariesQuery = z.output<
  typeof getJobApplicationSummariesQuerySchema
>;
