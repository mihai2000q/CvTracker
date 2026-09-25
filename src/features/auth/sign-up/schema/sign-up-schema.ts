import { z } from 'zod';

export const SignUpSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be blank'),
  email: z.email('Email is invalid'),
  password: z
    .string()
    .refine((val) => val.length > 0, 'Password cannot be blank')
    .refine((val) => val.length >= 8, 'Password must have at least 8 characters')
    .refine((val) => /[A-Z]/.test(val), 'Password must have at least 1 upper character')
    .refine((val) => /[a-z]/.test(val), 'Password must have at least 1 lower character')
    .refine((val) => /[0-9]/.test(val), 'Password must have at least 1 digit'),
});
