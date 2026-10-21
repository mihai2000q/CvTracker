import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// The hash of a password nobody has, made with the same cost as a real one. Checking against it
// takes as long as checking a real user, so a sign-in for an email that isn't registered can't be
// told apart by how long it takes
export const UNKNOWN_USER_PASSWORD_HASH = hashPassword(randomUUID());

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
