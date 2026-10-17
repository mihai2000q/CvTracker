import { all, and, or } from '@prisma/orm-postgres/orm-client';
import { RawExpr, toExpr } from '@prisma/orm-postgres/relational-core';
import type { AnyExpression } from '@prisma/orm-postgres/relational-core/ast';

// What a column can be compared with: a model accessor's field, or any object with the
// comparisons, each a method named like its operator
type Comparable = object;

// A filter that isn't a model field of the same name says which column it compares
// (`organization` filtering `organizationId`)
export interface FilterColumn<Row> {
  column: (row: Row) => Comparable;
}

// The `where` selector for a filter: every entry has to match. A field is the model field of
// its name unless its entry in `filters` has a `column`.
export function buildWhere<Row, Field extends string>(
  filterBy: readonly { field: Field; operator: string; value: unknown }[],
  filters: Record<Field, unknown> = {} as Record<Field, unknown>
): (row: Row) => AnyExpression {
  return (row) =>
    and(
      ...filterBy.map(({ field, operator, value }) => {
        const column = (filters[field] as Partial<FilterColumn<Row>> | undefined)?.column;
        const comparable = column ? column(row) : (row as Record<string, Comparable>)[field];
        return (comparable as Record<string, (value: unknown) => AnyExpression>)[operator](value);
      })
    );
}

// A search column: what contains the term, and optionally what is close to it, typos included
export interface SearchColumn {
  ilike(pattern: string): AnyExpression;
  similar?(term: string): AnyExpression;
}

// Terms shorter than this have too few trigrams to tell a typo from a different word
const MIN_SIMILAR_TERM_LENGTH = 3;
// How close (0 to 1) a word of the text has to be to the term; the Postgres default is 0.6
const SIMILARITY_THRESHOLD = 0.45;

// `column` is close to `term` when one of its words is: `word_similarity` from `pg_trgm`, whose
// trigram indexes make `ilike` fast too
export function similarTo(column: { buildAst(): AnyExpression }, term: string): AnyExpression {
  return new RawExpr({
    parts: [
      'word_similarity(',
      toExpr(term, { codecId: 'pg/text@1' }),
      ', ',
      column.buildAst(),
      `) >= ${SIMILARITY_THRESHOLD}`,
    ],
    returns: { codecId: 'pg/bool@1', nullable: false },
  });
}

// A model field as a search column that also matches what is close to the term
export function fuzzy<Row>(
  field: (row: Row) => SearchColumn & { buildAst(): AnyExpression }
): (row: Row) => SearchColumn {
  return (row) => {
    const column = field(row);
    return {
      ilike: (pattern) => column.ilike(pattern),
      similar: (term) => similarTo(column, term),
    };
  };
}

// The `where` selector for a free-text search: rows where any of `columns` contains `term`,
// whatever its case, or is close to it when the column says how. A search without a term
// matches every row.
export function buildSearch<Row>(
  term: string | undefined,
  columns: readonly ((row: Row) => SearchColumn)[]
): (row: Row) => AnyExpression {
  if (!term) return () => all();

  // `%`, `_` and `\` in what was typed match themselves
  const pattern = `%${term.replace(/[\\%_]/g, '\\$&')}%`;
  const closeTo = term.length >= MIN_SIMILAR_TERM_LENGTH;
  return (row) =>
    or(
      ...columns.flatMap((column) => {
        const { ilike, similar } = column(row);
        return closeTo && similar ? [ilike(pattern), similar(term)] : [ilike(pattern)];
      })
    );
}
