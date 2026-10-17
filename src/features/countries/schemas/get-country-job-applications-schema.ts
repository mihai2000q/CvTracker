import { z } from 'zod';
import { pagePaginationSchema } from '@/schemas/page-pagination-schema.ts';

export const getCountryJobApplicationsQuerySchema = pagePaginationSchema.extend({
  countryId: z.uuid(),
});

export type GetCountryJobApplicationsQueryInput = z.input<
  typeof getCountryJobApplicationsQuerySchema
>;
export type GetCountryJobApplicationsQuery = z.output<typeof getCountryJobApplicationsQuerySchema>;
