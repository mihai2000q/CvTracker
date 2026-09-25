import { z } from 'zod';

export const SignInSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Email is invalid')),
  password: z.string().min(1, 'Password cannot be blank'),
});
