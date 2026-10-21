import { z } from 'zod';
import { zEmptyToUndefined } from '@/lib/zod/fields.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type';

export const documentSchema = z.object({
  type: z.enum(DocumentType, 'Document type is required'),
  name: z.string().trim().min(1, 'Name cannot be blank').max(150, 'Name is too long'),
  notes: zEmptyToUndefined(z.string().trim().optional()),
});
