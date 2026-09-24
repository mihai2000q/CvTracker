import { db } from './db.ts';
import { seedReferenceData } from './reference-data/index.ts';

await seedReferenceData(db);
console.log('Reference data seeded.');
process.exit(0);
