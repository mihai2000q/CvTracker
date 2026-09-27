import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Email is invalid')),
  password: z.string().min(1, 'Password cannot be blank'),
});

export type SignInForm = z.infer<typeof signInSchema>;
