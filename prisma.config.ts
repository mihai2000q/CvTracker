import 'dotenv/config';
import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';
import { databaseUrl } from './database/env.ts';

export default definePrismaConfig({
  orm: ormConfig({
    contract: './database/contract.ts',
    migrations: {
      dir: './database/migrations',
    },
    db: {
      connection: databaseUrl,
    },
  }),
});
