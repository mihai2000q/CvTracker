import type { Database } from '../db.ts';
import { sized } from '../field-values.ts';

const sampleUser = {
  email: sized<255>('dev@example.com'),
  name: sized<150>('Dev User'),
  // Placeholder only, not a real hash
  passwordHash: 'dev-sample-data-not-a-real-hash',
};

export async function seedSampleUser(db: Database) {
  await db.orm.public.User.where({ email: sampleUser.email }).upsert({
    create: sampleUser,
    update: { name: sampleUser.name },
  });
}
