import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };
import { databaseUrl } from './env.ts';

const dbClient = postgres<Contract>({
  contractJson,
  url: databaseUrl,
});

// Every model currently lives in the `public` namespace, so this is what
// the rest of the app calls `db` — `db.User.create(...)` instead of
// `db.orm.public.User.create(...)`. Import `dbClient` directly for anything
// that isn't a model query (e.g. `dbClient.close()` in a one-off script).
export const db = dbClient.orm.public;
export type Database = typeof db;
// What `dbClient.transaction` hands its callback, with the models reached the way `db` has them
export type Transaction = Parameters<
  Parameters<typeof dbClient.transaction>[0]
>[0]['orm']['public'];
export { dbClient };
