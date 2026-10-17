import { z } from 'zod';
import { pagePaginationSchema } from '@/schemas/page-pagination-schema.ts';

// The applications of a country, or the ones a document is used on
export const getJobApplicationSummariesQuerySchema = pagePaginationSchema
  .extend({
    countryId: z.uuid().optional(),
    documentId: z.uuid().optional(),
  })
  .refine(({ countryId, documentId }) => countryId || documentId, {
    message: 'A country or a document is required',
  });

export type GetJobApplicationSummariesQueryInput = z.input<
  typeof getJobApplicationSummariesQuerySchema
>;
export type GetJobApplicationSummariesQuery = z.output<
  typeof getJobApplicationSummariesQuerySchema
>;
