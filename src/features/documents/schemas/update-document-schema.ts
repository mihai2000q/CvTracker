import { z } from 'zod';
import { zEmptyToUndefined, zFile } from '@/lib/zod/fields.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type';

export const updateDocumentSchema = z.object({
  id: z.uuid('Document must be identifiable'),
  type: z.enum(DocumentType, 'Document type is required'),
  name: z.string().trim().min(1, 'Name cannot be blank').max(150, 'Name is too long'),
  file: zEmptyToUndefined(zFile().optional()),
  notes: zEmptyToUndefined(z.string().trim().optional()),
});

export type UpdateDocumentForm = z.infer<typeof updateDocumentSchema>;
