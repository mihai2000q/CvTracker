'use server';

import { redirect } from 'next/navigation';
import type { SubmissionResult } from '@conform-to/react';
import { db } from '@database/db';
import { sized } from '@database/field-values';
import { createAuthToken } from '@/lib/jwt';
import { verifyPassword } from '@/lib/password';
import { createSession } from '@/lib/session';
import { signInSchema } from '@/features/auth/sign-in/schemas/sign-in-schema.ts';
import { zodValidateForm } from '@/lib/zod.ts';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials.';

export async function signIn(
  _lastResult: SubmissionResult | undefined,
  formData: FormData
): Promise<SubmissionResult> {
  const submission = zodValidateForm({ formData, schema: signInSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { email, password } = submission.value;

  const user = await db.User.first({ email: sized<255>(email) });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return submission.reply({ formErrors: [INVALID_CREDENTIALS_MESSAGE] });
  }

  const token = await createAuthToken(user);
  await createSession(token);

  redirect('/dashboard');
}
