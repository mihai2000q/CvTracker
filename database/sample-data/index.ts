import type { Database } from '../db.ts';
import { seedSampleUser } from './users.ts';

// Optional, dev-only fixtures — NOT required for the app to function.
// Run manually via `npm run db:seed:sample` when you want example data to
// develop the frontend against. Never part of `db:setup`.
// Execution order lives here, explicitly — not inferred from filenames.
export async function seedSampleData(db: Database) {
  await seedSampleUser(db);
}
