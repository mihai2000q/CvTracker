import { z } from 'zod';
import { zFile, zToArray } from '@/lib/zod/fields.ts';
import { documentSchema } from '@/features/documents/schemas/document-schema.ts';

export const createDocumentSchema = documentSchema.extend({
  file: zFile(),
  skillIds: zToArray(z.array(z.uuid('Skill must be identifiable'))),
});

export type CreateDocumentForm = z.infer<typeof createDocumentSchema>;
