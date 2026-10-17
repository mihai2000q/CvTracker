import { rm } from 'node:fs/promises';
import path from 'node:path';
import { db } from './db.ts';
import { uuid } from './field-values.ts';
import { uploadsDirectory } from './sample-data/documents.ts';

// Removes everything the sample data created, and nothing of any other user.
// Applications go first, since they restrict deleting the documents and organizations they point to
const userId = uuid('00000000-0000-7000-8000-000000000001');
await db.JobApplication.where({ userId }).deleteAll();
await db.Document.where({ userId }).deleteAll();
await db.Organization.where({ userId }).deleteAll();
await db.Skill.where({ userId }).deleteAll();
await rm(path.join(uploadsDirectory(), userId), { recursive: true, force: true });
await db.User.where({ id: userId }).deleteAll();

console.log('Sample data cleared.');
process.exit(0);
