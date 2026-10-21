import { z } from 'zod';
import { contactSchema } from '@/features/organizations/schemas/contact-schema.ts';

export const updateContactSchema = contactSchema.extend({
  id: z.uuid('Contact must be identifiable'),
});

export type UpdateContactForm = z.infer<typeof updateContactSchema>;
