import { z } from 'zod';
import { contactSchema } from '@/features/organizations/schemas/contact-schema.ts';

export const createContactSchema = contactSchema.extend({
  organizationId: z.uuid('Organization must be identifiable'),
});

export type CreateContactForm = z.infer<typeof createContactSchema>;
