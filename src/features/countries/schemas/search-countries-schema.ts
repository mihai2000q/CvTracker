import { z } from 'zod';
import { cursorPaginationSchema } from '@/schemas/cursor-pagination-schema.ts';

export const searchCountriesQuerySchema = cursorPaginationSchema.extend({
  search: z.string().trim().optional(),
});

export type SearchCountriesQueryInput = z.input<typeof searchCountriesQuerySchema>;
export type SearchCountriesQuery = z.output<typeof searchCountriesQuerySchema>;
