// The comparisons a filter can make. Each is a method of the same name on a model accessor's
// field, and which ones a field has depends on its type.
// The type is what is used throughout. The list is only used by the filter schema, to tell a
// known operator from any other word in a URL.
export const FILTER_OPERATORS = ['eq', 'neq', 'in', 'notIn', 'gt', 'gte', 'lt', 'lte'] as const;
export type FilterOperator = (typeof FILTER_OPERATORS)[number];

export interface FilterEntry<Field extends string = string> {
  field: Field;
  operator: FilterOperator;
  // Already parsed to what the field holds; a list for the operators that compare against one
  value: unknown;
}

// `field:operator:value` entries, the form a filter takes in a URL. A list is its values
// joined by commas.
export function serializeFilter(filterBy: readonly FilterEntry[]): string[] {
  return filterBy.map(
    ({ field, operator, value }) =>
      `${field}:${operator}:${Array.isArray(value) ? value.join(',') : String(value)}`
  );
}

// A control that sets one filter: the link that sets `field` to `value` (or clears it when
// `value` is undefined) and leaves the other filters alone, and whether it is set that way now.
export function buildFilterOption<Field extends string>(
  field: Field,
  operator: FilterOperator,
  value: unknown,
  filterBy: readonly FilterEntry<Field>[],
  hrefForFilterBy: (filterBy: FilterEntry<Field>[]) => string
) {
  const isThis = (entry: FilterEntry<Field>) =>
    entry.field === field && entry.operator === operator;
  const current = filterBy.find(isThis);
  const others = filterBy.filter((entry) => !isThis(entry));

  return {
    active: current?.value === value,
    href: hrefForFilterBy(value === undefined ? others : [...others, { field, operator, value }]),
  };
}
