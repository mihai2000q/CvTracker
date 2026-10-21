'use server';

import { redirect } from 'next/navigation';
import type { SubmissionResult } from '@conform-to/react';
import { db } from '@database/db.ts';
import { sized } from '@database/field-values.ts';
import { isUniqueConstraintError } from '@database/sql-error.ts';
import { createAuthToken } from '@/lib/auth/jwt.ts';
import { hashPassword } from '@/lib/auth/password.ts';
import { createSession } from '@/lib/auth/session.ts';
import { signUpSchema } from '@/features/auth/sign-up/schemas/sign-up-schema.ts';
import { zodValidateForm } from '@/lib/zod/parse.ts';

export async function signUp(
  _lastResult: SubmissionResult | undefined,
  formData: FormData
): Promise<SubmissionResult> {
  const submission = zodValidateForm({ formData, schema: signUpSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { name, email, password } = submission.value;
  const passwordHash = await hashPassword(password);

  let user;
  try {
    user = await db.User.create({
      email: sized<255>(email),
      name: sized<150>(name),
      passwordHash,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return submission.reply({ formErrors: ['Email already in use.'] });
    }
    throw error;
  }

  const token = await createAuthToken(user);
  await createSession(token);

  redirect('/dashboard');
}
