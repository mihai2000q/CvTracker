import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { JWTPayload } from 'jose';
import { db } from '@database/db';
import { uuid } from '@database/field-values';
import { createAuthToken, verifyAuthToken } from '@/lib/jwt';

const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_COOKIE_MAX_AGE,
};

// authoritative check - used on server side
export async function verifySession(): Promise<JWTPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  const result = token ? await verifyAuthToken(token) : ({ status: 'invalid' } as const);

  if (result.status === 'valid') {
    return result.payload;
  }

  if (result.status === 'expired' && result.payload.sub) {
    const user = await db.User.where({ id: uuid(result.payload.sub) }).first();
    if (user) {
      const newToken = await createAuthToken(user.id);
      cookieStore.set('session', newToken, sessionCookieOptions);
      return result.payload;
    }
  }

  cookieStore.delete('session');
  redirect('/sign-in');
}

// A valid session with no `sub` means a malformed/foreign token
export function getUserId(session: JWTPayload): string {
  if (!session.sub) {
    throw new Error('Session is missing a user id');
  }
  return session.sub;
}

// optimistic check - used on client side
export async function hasValidSession(): Promise<boolean> {
  return (await cookies()).has('session');
}
