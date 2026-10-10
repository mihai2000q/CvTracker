import { z } from 'zod';
import { zEmptyToUndefined, zFile, zToArray } from '@/lib/zod/fields.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type';

export const createDocumentSchema = z.object({
  type: z.enum(DocumentType, 'Document type is required'),
  name: z.string().trim().min(1, 'Name cannot be blank').max(150, 'Name is too long'),
  file: zFile(),
  notes: zEmptyToUndefined(z.string().trim().optional()),
  skillIds: zToArray(z.array(z.uuid('Skill must be identifiable'))),
});

export type CreateDocumentForm = z.infer<typeof createDocumentSchema>;
