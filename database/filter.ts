import { all, and, or } from '@prisma/orm-postgres/orm-client';
import type { AnyExpression } from '@prisma/orm-postgres/relational-core/ast';

// What a column can be compared with, by the operator's name: the method of that name on a model
// accessor's field
type Comparable = Partial<Record<string, (value: never) => AnyExpression>>;

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
        return (comparable[operator] as (value: unknown) => AnyExpression)(value);
      })
    );
}

// The `where` selector for a free-text search: rows where any of `columns` contains `term`,
// whatever its case. A search without a term matches every row.
export function buildSearch<Row>(
  term: string | undefined,
  columns: readonly ((row: Row) => { ilike(pattern: string): AnyExpression })[]
): (row: Row) => AnyExpression {
  if (!term) return () => all();

  // `%`, `_` and `\` in what was typed match themselves
  const pattern = `%${term.replace(/[\\%_]/g, '\\$&')}%`;
  return (row) => or(...columns.map((column) => column(row).ilike(pattern)));
}
