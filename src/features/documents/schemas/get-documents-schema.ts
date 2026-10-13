import { z } from 'zod';
import { pagePaginationSchema } from '@/schemas/page-pagination-schema.ts';
import { sortSchema } from '@/schemas/sort-schema.ts';
import { filterSchema } from '@/schemas/filter-schema.ts';
import { DOCUMENT_FILTERS } from '@/features/documents/constants/document-filtering.ts';
import { DOCUMENT_SORT_FIELDS } from '@/features/documents/constants/document-sorting.tsx';

export const getDocumentsQuerySchema = pagePaginationSchema.extend({
  sortBy: sortSchema(DOCUMENT_SORT_FIELDS),
  filterBy: filterSchema(DOCUMENT_FILTERS),
  search: z.string().trim().max(100).optional(),
});

export type GetDocumentsQueryInput = z.input<typeof getDocumentsQuerySchema>;
export type GetDocumentsQuery = z.output<typeof getDocumentsQuerySchema>;
