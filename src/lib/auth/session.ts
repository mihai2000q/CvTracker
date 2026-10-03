import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { JWTPayload } from 'jose';
import { db } from '@database/db';
import { uuid } from '@database/field-values';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { User } from '@/features/user/types/user.ts';

export const SESSION_COOKIE_NAME = 'session';

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days, in seconds
};

export async function createSession(token: string) {
  (await cookies()).set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

// Authoritative check
export async function verifySession(): Promise<JWTPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const result = token ? await verifyAuthToken(token) : ({ status: 'invalid' } as const);

  if (result.status === 'valid') {
    return result.payload;
  }

  redirect('/sign-in');
}

// A valid session with no `sub` means a malformed/foreign token
export function getUserId(session: JWTPayload): string {
  if (!session.sub) {
    throw new Error('Session is missing a user id');
  }
  return session.sub;
}

export async function getCurrentUser(): Promise<User> {
  const session = await verifySession()
  if (!session.sub) {
    throw new Error('Session is missing a user id');
  }
  const user = await db.User
    .select('id', 'email', 'name')
    .first({ id: uuid(session.sub) });
  if (!user) {
    // Valid token, deleted user: clear the stale cookie, then sign in again.
    redirect('/api/session/clear');
  }
  return { ...user };
}
