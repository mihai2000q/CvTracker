import type { SearchParamsState } from '@/lib/search-params.ts';
import { z } from 'zod';
import { getCountriesQuerySchema } from '@/features/countries/schemas/get-countries-schema.ts';
import { DEFAULT_COUNTRY_SORT_BY } from '@/features/countries/constants/country-sorting.tsx';
import { serializeSort } from '@/lib/sort.ts';

enum CountriesSearchParam {
  Page = 'p',
  SortBy = 's',
}

const countriesSearchParamsSchema = z.object({
  page: getCountriesQuerySchema.shape.page.catch(1),
  sortBy: getCountriesQuerySchema.shape.sortBy
    .catch([])
    .transform((sortBy) => (sortBy.length > 0 ? sortBy : DEFAULT_COUNTRY_SORT_BY)),
});

export type CountriesSearchParamsState = z.infer<typeof countriesSearchParamsSchema>;

export const countriesSearchParamsState: SearchParamsState<CountriesSearchParamsState> = {
  keys: Object.values(CountriesSearchParam),
  deserialize: (params) =>
    countriesSearchParamsSchema.parse({
      page: params.get(CountriesSearchParam.Page) ?? undefined,
      sortBy: params.getAll(CountriesSearchParam.SortBy),
    }),
  serialize: ({ page, sortBy }) => {
    const params = new URLSearchParams({ [CountriesSearchParam.Page]: String(page) });
    serializeSort(sortBy).forEach((entry) => params.append(CountriesSearchParam.SortBy, entry));
    return params;
  },
};
