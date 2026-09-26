import { errors, type JWTPayload, jwtVerify, SignJWT } from 'jose';
import { requireEnv } from '@/lib/env';
import { User } from '@/lib/types.ts';

const secret = new TextEncoder().encode(requireEnv('JWT_SECRET'));

export function createAuthToken(user: User): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(requireEnv('JWT_EXPIRES_IN'))
    .sign(secret);
}

export type AuthTokenVerification =
  | { status: 'valid'; payload: JWTPayload }
  | { status: 'expired'; payload: JWTPayload }
  | { status: 'invalid' };

export async function verifyAuthToken(token: string): Promise<AuthTokenVerification> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    return { status: 'valid', payload };
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      return { status: 'expired', payload: error.payload };
    }
    return { status: 'invalid' };
  }
}
