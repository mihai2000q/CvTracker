import { z } from 'zod';
import { zEmptyToUndefined } from '@/lib/zod/fields.ts';

export const contactSchema = z.object({
  name: z.string('Name is required').trim().min(1, 'Name is required').max(150, 'Name is too long'),
  email: zEmptyToUndefined(z.email('Email is invalid').max(255, 'Email is too long').optional()),
  phone: zEmptyToUndefined(z.string().trim().max(50, 'Phone is too long').optional()),
  role: zEmptyToUndefined(z.string().trim().max(100, 'Role is too long').optional()),
});

export type ContactForm = z.infer<typeof contactSchema>;
