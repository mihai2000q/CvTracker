import { z } from 'zod';
import { cursorPaginationSchema } from '@/schemas/cursor-pagination-schema.ts';

export const getRecentActivityQuerySchema = cursorPaginationSchema.extend({
  limit: cursorPaginationSchema.shape.limit.default(10),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
});

export type GetRecentActivityQueryInput = z.input<typeof getRecentActivityQuerySchema>;
export type GetRecentActivityQuery = z.output<typeof getRecentActivityQuerySchema>;
