import { z } from 'zod';
import { pagePaginationSchema } from '@/schemas/page-pagination-schema.ts';
import { sortSchema } from '@/schemas/sort-schema.ts';
import {
  COUNTRY_SCOPES,
  DEFAULT_COUNTRY_SCOPE,
} from '@/features/countries/constants/country-filtering.ts';
import { COUNTRY_SORT_FIELDS } from '@/features/countries/constants/country-sorting.tsx';

export const getCountriesQuerySchema = pagePaginationSchema.extend({
  sortBy: sortSchema(COUNTRY_SORT_FIELDS),
  scope: z.enum(COUNTRY_SCOPES).default(DEFAULT_COUNTRY_SCOPE),
  search: z.string().trim().max(100).optional(),
});

export type GetCountriesQueryInput = z.input<typeof getCountriesQuerySchema>;
export type GetCountriesQuery = z.output<typeof getCountriesQuerySchema>;
