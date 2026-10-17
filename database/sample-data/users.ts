import bcrypt from 'bcrypt';
import type { Database } from '../db.ts';
import { sized, uuid } from '../field-values.ts';

export async function seedSampleUsers(db: Database) {
  await db.User.create({
    id: uuid('00000000-0000-7000-8000-000000000001'),
    email: sized<255>('dev@example.com'),
    name: sized<150>('Dev User'),
    passwordHash: await bcrypt.hash('Password123', 12),
  });
}
