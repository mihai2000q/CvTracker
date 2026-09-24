import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };
import { databaseUrl } from './env.ts';

export const db = postgres<Contract>({
  contractJson,
  url: databaseUrl,
});

export type Database = typeof db;
