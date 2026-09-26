'use server';

import { redirect } from 'next/navigation';
import { parseWithZod } from '@conform-to/zod/v4';
import type { SubmissionResult } from '@conform-to/react';
import { db } from '@database/db';
import { sized } from '@database/field-values';
import { createAuthToken } from '@/lib/jwt';
import { verifyPassword } from '@/lib/password';
import { createSession } from '@/lib/session';
import { SignInSchema } from '@/features/auth/sign-in/schemas/sign-in-schema.ts';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials.';

export async function signIn(
  _lastResult: SubmissionResult | undefined,
  formData: FormData
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, { schema: SignInSchema, disableAutoCoercion: true });
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
