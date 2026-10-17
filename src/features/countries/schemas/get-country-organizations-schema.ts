import { z } from 'zod';
import { pagePaginationSchema } from '@/schemas/page-pagination-schema.ts';
import { sortSchema } from '@/schemas/sort-schema.ts';
import { ORGANIZATION_SORT_FIELDS } from '@/features/organizations/constants/organization-sorting.tsx';

export const getCountryOrganizationsQuerySchema = pagePaginationSchema.extend({
  countryId: z.uuid(),
  sortBy: sortSchema(ORGANIZATION_SORT_FIELDS),
});

export type GetCountryOrganizationsQueryInput = z.input<typeof getCountryOrganizationsQuerySchema>;
export type GetCountryOrganizationsQuery = z.output<typeof getCountryOrganizationsQuerySchema>;
