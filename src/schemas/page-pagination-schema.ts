import { z } from 'zod';

export const DEFAULT_PAGE_SIZE = 20;

export const pagePaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(DEFAULT_PAGE_SIZE),
});
