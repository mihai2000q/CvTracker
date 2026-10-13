import { z } from 'zod';
import { pagePaginationSchema } from '@/schemas/page-pagination-schema.ts';
import { sortSchema } from '@/schemas/sort-schema.ts';
import { COUNTRY_SORT_FIELDS } from '@/features/countries/constants/country-sorting.tsx';

export const getCountriesQuerySchema = pagePaginationSchema.extend({
  sortBy: sortSchema(COUNTRY_SORT_FIELDS),
});

export type GetCountriesQueryInput = z.input<typeof getCountriesQuerySchema>;
export type GetCountriesQuery = z.output<typeof getCountriesQuerySchema>;
