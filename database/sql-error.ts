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

// Call from a `catch` around any database operation. If the error is a known
// constraint violation it logs the constraint, table and Postgres detail
// (server-side only) and returns a form error naming the constraint (declared
// in the model relations/indexes, e.g. `fk_job_application_country_id`), ready
// for `submission.reply()`; otherwise it returns null so the caller can rethrow.
export function constraintViolationReply(error: unknown) {
  const { constraint, table, detail } = (error ?? {}) as {
    constraint?: string;
    table?: string;
    detail?: string;
  };
  const name = constraint ?? 'unknown';

  if (isForeignKeyConstraintError(error)) {
    console.error('Foreign key violation:', { constraint, table, detail });
    return { formErrors: [`A related record no longer exists (${name}).`] };
  }
  if (isUniqueConstraintError(error)) {
    console.error('Unique violation:', { constraint, table, detail });
    return { formErrors: [`This record already exists (${name}).`] };
  }
  return null;
}
