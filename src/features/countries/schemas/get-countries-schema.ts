import { z } from 'zod';
import { pagePaginationSchema } from '@/schemas/page-pagination-schema.ts';

export const getCountriesQuerySchema = pagePaginationSchema.extend({});

export type GetCountriesQueryInput = z.input<typeof getCountriesQuerySchema>;
export type GetCountriesQuery = z.output<typeof getCountriesQuerySchema>;
