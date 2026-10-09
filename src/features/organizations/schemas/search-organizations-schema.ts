import { z } from 'zod';
import { cursorPaginationSchema } from '@/schemas/cursor-pagination-schema.ts';

export const searchOrganizationsQuerySchema = cursorPaginationSchema.extend({
  search: z.string().trim().optional(),
});

export type SearchOrganizationsQueryInput = z.input<typeof searchOrganizationsQuerySchema>;
export type SearchOrganizationsQuery = z.output<typeof searchOrganizationsQuerySchema>;
