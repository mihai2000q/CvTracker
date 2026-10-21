import { z } from 'zod';
import { zEmptyToUndefined, zFile } from '@/lib/zod/fields.ts';
import { documentSchema } from '@/features/documents/schemas/document-schema.ts';

export const updateDocumentSchema = documentSchema.extend({
  id: z.uuid('Document must be identifiable'),
  file: zEmptyToUndefined(zFile().optional()),
});

export type UpdateDocumentForm = z.infer<typeof updateDocumentSchema>;
