import { db } from './db.ts';
import { seedSampleData } from './sample-data/index.ts';

await seedSampleData(db);
process.exit(0);
