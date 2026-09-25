'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { parseWithZod } from '@conform-to/zod/v4';
import type { SubmissionResult } from '@conform-to/react';
import { db } from '@database/db';
import { sized } from '@database/field-values';
import { isUniqueConstraintError } from '@database/sql-error';
import { createAuthToken } from '@/lib/jwt';
import { hashPassword } from '@/lib/password';
import { SignUpSchema } from '@/features/auth/sign-up/schemas/sign-up-schema';

export async function signUp(
  _lastResult: SubmissionResult | undefined,
  formData: FormData
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, { schema: SignUpSchema, disableAutoCoercion: true });
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

  const token = await createAuthToken(user.id);
  (await cookies()).set('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  redirect('/dashboard');
}
