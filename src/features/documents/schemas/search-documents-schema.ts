import { z } from 'zod';
import { cursorPaginationSchema } from '@/schemas/cursor-pagination-schema.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';

export const searchDocumentsQuerySchema = cursorPaginationSchema.extend({
  type: z.enum(DocumentType, 'Document type is required'),
  search: z.string().trim().optional(),
});

export type SearchDocumentsQueryInput = z.input<typeof searchDocumentsQuerySchema>;
export type SearchDocumentsQueryParams = Partial<Record<keyof SearchDocumentsQueryInput, string>>;
export type SearchDocumentsQuery = z.output<typeof searchDocumentsQuerySchema>;
