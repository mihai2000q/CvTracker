import type { Orderable } from '@prisma/orm-postgres/orm-client';

type OrderByItem = ReturnType<Orderable['asc']>;

// What a sortable field orders by: a column, a to-one relation's column or a
// to-many relation's count, anything the model accessor hands back as `Orderable`.
export type Sorters<Row, Field extends string> = Record<Field, (row: Row) => Orderable>;

// Keys that come after the sort, ending on a unique column, so rows that share every
// sort value keep a stable order across pages instead of shuffling.
export type Tiebreakers<Row> = readonly ((row: Row) => OrderByItem)[];

// The `orderBy` selectors for a sort, in priority order, then the tiebreakers. Empty values
// sort last in either direction, where Postgres alone would put them first when descending.
export function buildOrderBy<Row, Field extends string>(
  sortBy: readonly { field: Field; direction: 'asc' | 'desc' }[],
  sorters: Sorters<Row, Field>,
  tiebreakers: Tiebreakers<Row>
): ((row: Row) => OrderByItem)[] {
  return [
    ...sortBy.map(
      ({ field, direction }) =>
        (row: Row) =>
          sorters[field](row)[direction]({ nulls: 'last' })
    ),
    ...tiebreakers,
  ];
}
