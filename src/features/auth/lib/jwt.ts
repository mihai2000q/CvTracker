import { SignJWT } from 'jose';
import { requireEnv } from '@/lib/env';

const secret = new TextEncoder().encode(requireEnv('JWT_SECRET'));

export function createAuthToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(requireEnv('JWT_EXPIRES_IN'))
    .sign(secret);
}
