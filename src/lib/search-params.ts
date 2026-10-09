export interface SearchParamsState<TState> {
  keys: readonly string[];
  deserialize: (params: URLSearchParams) => TState;
  serialize: (value: TState) => URLSearchParams;
}

type NextSearchParams = Record<string, string | string[] | undefined>;

// The parsed values of a page's search params plus a link builder that
// keeps the other params.
export function readSearchParams<T>(
  state: SearchParamsState<T>,
  searchParams: NextSearchParams
) {
  const params = toURLSearchParams(searchParams);
  const values = state.deserialize(params);

  return {
    values,
    hrefFor: (pathname: string, patch: Partial<T>) =>
      buildSearchParamsHref(pathname, state, params, { ...values, ...patch }),
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
function buildSearchParamsHref<T>(
  pathname: string,
  state: SearchParamsState<T>,
  currentParams: URLSearchParams,
  values: T
): string {
  const nextParams = new URLSearchParams(currentParams);
  state.keys.forEach((key) => nextParams.delete(key));
  state.serialize(values).forEach((value, key) => nextParams.set(key, value));
  const query = nextParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}
