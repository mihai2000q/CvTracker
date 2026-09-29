import { z } from 'zod';
import { cursorPaginationSchema } from '@/schemas/cursor-pagination-schema.ts';

export const searchCountriesQuerySchema = cursorPaginationSchema.extend({
  search: z.string().trim().optional(),
});

export type SearchCountriesQuery = z.input<typeof searchCountriesQuerySchema>;
