import { serializeSort, type SortEntry } from '@/lib/sort.ts';
import {
  buildFilterOption,
  serializeFilter,
  type FilterEntry,
  type FilterOperator,
} from '@/lib/filter.ts';

export interface SearchParamsState<TState> {
  keys: readonly string[];
  deserialize: (params: URLSearchParams) => TState;
  serialize: (value: TState) => URLSearchParams;
}

type NextSearchParams = Record<string, string | string[] | undefined>;

// The parsed values of a page's search params plus a link builder that
// keeps the other params.
export function readSearchParams<T>(state: SearchParamsState<T>, searchParams: NextSearchParams) {
  const params = toURLSearchParams(searchParams);
  const values = state.deserialize(params);

  return {
    values,
    hrefFor: (pathname: string, patch: Partial<T>) =>
      buildSearchParamsHref(pathname, state, params, { ...values, ...patch }),
  };
}

// `readSearchParams` for a paginated, sorted, filtered list: the page, the sort and filter
// serialized (the form a query function validates) and the links to move between pages,
// orders and filters.
export function readListSearchParams<
  T extends { page: number; sortBy: SortEntry[]; filterBy?: FilterEntry[]; search?: string },
>(state: SearchParamsState<T>, pathname: string, searchParams: NextSearchParams) {
  const { values, hrefFor } = readSearchParams(state, searchParams);
  const filterBy = (values.filterBy ?? []) as NonNullable<T['filterBy']>;
  const hrefForFilterBy = (filterBy: NonNullable<T['filterBy']>) =>
    hrefFor(pathname, { filterBy, page: 1 } as Partial<T>);

  return {
    values: {
      ...values,
      sortBy: serializeSort(values.sortBy),
      filterBy: serializeFilter(filterBy),
    },
    hrefForPage: (page: number) => hrefFor(pathname, { page } as Partial<T>),
    hrefForSortBy: (sortBy: T['sortBy']) => hrefFor(pathname, { sortBy, page: 1 } as Partial<T>),
    // Any other change to the list starts over from the first page too
    hrefForPatch: (patch: Partial<T>) => hrefFor(pathname, { ...patch, page: 1 }),
    hrefForNoFilters: () =>
      hrefFor(pathname, {
        filterBy: [] as NonNullable<T['filterBy']>,
        search: undefined,
        page: 1,
      } as Partial<T>),
    filterOption: (
      field: NonNullable<T['filterBy']>[number]['field'],
      operator: FilterOperator,
      value: unknown
    ) => buildFilterOption(field, operator, value, filterBy, hrefForFilterBy),
  };
}

// Next hands pages `searchParams` as a plain record; arrays are repeated keys.
function toURLSearchParams(params: NextSearchParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    (Array.isArray(value) ? value : [value]).forEach((v) => searchParams.append(key, v));
  });
  return searchParams;
}

// Replaces this state's keys in `current` and leaves every other param (search, filters) alone.
export function buildSearchParamsHref<T>(
  pathname: string,
  state: SearchParamsState<T>,
  currentParams: URLSearchParams,
  values: T
): string {
  const nextParams = new URLSearchParams(currentParams);
  state.keys.forEach((key) => nextParams.delete(key));
  state.serialize(values).forEach((value, key) => nextParams.append(key, value));
  const query = nextParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}
