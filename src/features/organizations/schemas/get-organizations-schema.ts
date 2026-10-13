import { z } from 'zod';
import { pagePaginationSchema } from '@/schemas/page-pagination-schema.ts';
import { filterSchema } from '@/schemas/filter-schema.ts';
import { ORGANIZATION_FILTERS } from '@/features/organizations/constants/organization-filtering.ts';
import { sortSchema } from '@/schemas/sort-schema.ts';
import { ORGANIZATION_SORT_FIELDS } from '@/features/organizations/constants/organization-sorting.tsx';

export const getOrganizationsQuerySchema = pagePaginationSchema.extend({
  sortBy: sortSchema(ORGANIZATION_SORT_FIELDS),
  filterBy: filterSchema(ORGANIZATION_FILTERS),
  search: z.string().trim().max(100).optional(),
});

export type GetOrganizationsQueryInput = z.input<typeof getOrganizationsQuerySchema>;
export type GetOrganizationsQuery = z.output<typeof getOrganizationsQuerySchema>;
