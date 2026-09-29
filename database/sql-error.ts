// Prisma wraps the raw pg driver error in its own SqlQueryError, which
// exposes the Postgres error code as a top-level `sqlState`
const POSTGRES_UNIQUE_VIOLATION = '23505';
const POSTGRES_FOREIGN_KEY_VIOLATION = '23503';

function hasSqlState(error: unknown): error is { sqlState: string } {
  return typeof error === 'object' && error !== null && 'sqlState' in error;
}

export function isUniqueConstraintError(error: unknown): boolean {
  return hasSqlState(error) && error.sqlState === POSTGRES_UNIQUE_VIOLATION;
}

// A foreign key referencing a row that doesn't exist (e.g. a country id
// that was never real to begin with).
export function isForeignKeyConstraintError(error: unknown): boolean {
  return hasSqlState(error) && error.sqlState === POSTGRES_FOREIGN_KEY_VIOLATION;
}
