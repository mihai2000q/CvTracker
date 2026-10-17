import { z } from 'zod';
import { pagePaginationSchema } from '@/schemas/page-pagination-schema.ts';

export const getCountryOrganizationsQuerySchema = pagePaginationSchema.extend({
  countryId: z.uuid(),
});

export type GetCountryOrganizationsQueryInput = z.input<typeof getCountryOrganizationsQuerySchema>;
export type GetCountryOrganizationsQuery = z.output<typeof getCountryOrganizationsQuerySchema>;
