// Prisma wraps the raw pg driver error in its own SqlQueryError, which
// exposes the Postgres error code as a top-level `sqlState`
const POSTGRES_UNIQUE_VIOLATION = '23505';

function hasSqlState(error: unknown): error is { sqlState: string } {
  return typeof error === 'object' && error !== null && 'sqlState' in error;
}

export function isUniqueConstraintError(error: unknown): boolean {
  return hasSqlState(error) && error.sqlState === POSTGRES_UNIQUE_VIOLATION;
}
