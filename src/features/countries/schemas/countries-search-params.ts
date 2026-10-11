import type { SearchParamsState } from '@/lib/search-params.ts';
import { z } from 'zod';
import { getCountriesQuerySchema } from '@/features/countries/schemas/get-countries-schema.ts';

enum CountriesSearchParam {
  Page = 'p',
}

const countriesSearchParamsSchema = z.object({
  page: getCountriesQuerySchema.shape.page.catch(1),
});

export type CountriesSearchParamsState = z.infer<typeof countriesSearchParamsSchema>;

export const countriesSearchParamsState: SearchParamsState<CountriesSearchParamsState> = {
  keys: Object.values(CountriesSearchParam),
  deserialize: (params) =>
    countriesSearchParamsSchema.parse({
      page: params.get(CountriesSearchParam.Page) ?? undefined,
    }),
  serialize: ({ page }) => new URLSearchParams({ [CountriesSearchParam.Page]: String(page) }),
};
