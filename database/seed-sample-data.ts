import { db } from './db.ts';
import { seedSampleData } from './sample-data/index.ts';

await seedSampleData(db);
console.log('Sample data seeded.');
process.exit(0);
