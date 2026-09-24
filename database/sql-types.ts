import type { ContractHelpers } from './types.ts';

export function sqlTypes({ type }: ContractHelpers) {
  return {
    isoCode: type.sql.String(2),
    email: type.sql.String(255),
    varChar50: type.sql.String(50),
    varChar100: type.sql.String(100),
    varChar150: type.sql.String(150),
    varChar200: type.sql.String(200),
    varChar255: type.sql.String(255),
  };
}

export type SqlTypes = ReturnType<typeof sqlTypes>;
