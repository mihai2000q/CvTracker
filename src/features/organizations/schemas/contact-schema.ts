import { z } from 'zod';
import { zEmptyToUndefined } from '@/lib/zod/fields.ts';

const contactFields = {
  name: z.string('Name is required').trim().min(1, 'Name is required').max(150, 'Name is too long'),
  email: zEmptyToUndefined(z.email('Email is invalid').max(255, 'Email is too long').optional()),
  phone: zEmptyToUndefined(z.string().trim().max(50, 'Phone is too long').optional()),
  role: zEmptyToUndefined(z.string().trim().max(100, 'Role is too long').optional()),
};

export const createContactSchema = z.object({
  organizationId: z.uuid('Organization must be identifiable'),
  ...contactFields,
});

export const updateContactSchema = z.object({
  id: z.uuid('Contact must be identifiable'),
  ...contactFields,
});

export type CreateContactForm = z.infer<typeof createContactSchema>;
export type UpdateContactForm = z.infer<typeof updateContactSchema>;
