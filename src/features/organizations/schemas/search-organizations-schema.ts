import { z } from 'zod';
import { cursorPaginationSchema } from '@/schemas/cursor-pagination-schema.ts';

export const searchOrganizationsQuerySchema = cursorPaginationSchema.extend({
  search: z.string().trim().optional(),
});

export type SearchOrganizationsQuery = z.input<typeof searchOrganizationsQuerySchema>;
