import { z } from 'zod';

export const searchCountriesQuerySchema = z.object({
  search: z.string().trim().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().optional().default(40),
});

export type SearchCountriesQuery = z.input<typeof searchCountriesQuerySchema>;
