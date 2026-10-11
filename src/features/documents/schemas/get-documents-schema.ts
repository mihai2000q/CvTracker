import { z } from 'zod';
import { pagePaginationSchema } from '@/schemas/page-pagination-schema.ts';

export const getDocumentsQuerySchema = pagePaginationSchema.extend({});

export type GetDocumentsQueryInput = z.input<typeof getDocumentsQuerySchema>;
export type GetDocumentsQuery = z.output<typeof getDocumentsQuerySchema>;
