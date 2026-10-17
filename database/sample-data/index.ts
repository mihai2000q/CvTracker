import type { Database } from '../db.ts';
import { uuid } from '../field-values.ts';
import { seedReferenceData } from '../reference-data/index.ts';
import { seedSampleDocuments } from './documents.ts';
import { seedSampleJobApplications } from './job-applications.ts';
import { seedSampleOrganizations } from './organizations.ts';
import { seedSampleSkills } from './skills.ts';
import { seedSampleUsers } from './users.ts';

// Optional, dev-only fixtures — NOT required for the app to function.
// Run manually via `npm run db:seed:sample` when you want example data to
// develop the frontend against. Never part of `db:setup`.
// Needs the reference data (countries): seeds it first when there are no countries yet.
// Runs once: if the dev user is already there, nothing is touched. To start over,
// `npm run db:clear:sample` first.
// Execution order lives here, explicitly — not inferred from filenames.
export async function seedSampleData(db: Database) {
  const { total: countries } = await db.Country.aggregate((aggregate) => ({ total: aggregate.count() }));
  if (countries === 0) {
    console.log('No countries found, seeding the reference data first.');
    await seedReferenceData(db);
  }

  const devUser = await db.User.first({ id: uuid('00000000-0000-7000-8000-000000000001') });
  if (devUser) {
    console.log('Sample data already seeded (the dev user exists). Run `npm run db:clear:sample` to start over.');
    return;
  }

  await seedSampleUsers(db);
  await seedSampleSkills(db);
  await seedSampleDocuments(db);
  await seedSampleOrganizations(db);
  await seedSampleJobApplications(db);

  console.log('Sample data seeded. Sign in as dev@example.com, password: Password123');
}
