import type { Database } from '../db.ts';
import { seedCountries } from './countries.ts';

// Required bootstrap data — every instance of this app needs this to
// function (you can't create an Organization or JobApplication without a
// Country to reference). Run via `npm run db:seed`, part of `db:setup`.
// Execution order lives here, explicitly — not inferred from filenames.
export async function seedReferenceData(db: Database) {
  await seedCountries(db);
}
