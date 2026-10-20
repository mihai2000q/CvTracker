import { z } from 'zod';
import { cursorPaginationSchema } from '@/schemas/cursor-pagination-schema.ts';

export const getUpcomingInterviewsQuerySchema = cursorPaginationSchema.extend({
  limit: cursorPaginationSchema.shape.limit.default(10),
});

export type GetUpcomingInterviewsQueryInput = z.input<typeof getUpcomingInterviewsQuerySchema>;
export type GetUpcomingInterviewsQuery = z.output<typeof getUpcomingInterviewsQuerySchema>;
