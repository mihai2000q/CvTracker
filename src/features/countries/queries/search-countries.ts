import 'server-only';
import { buildSearch } from '@database/filter.ts';
import { COUNTRY_SEARCH_COLUMNS } from '@/features/countries/constants/country-filtering.ts';
import { db } from '@database/db.ts';
import { CountrySummary } from '@/features/countries/types/country.ts';
import {
  SearchCountriesQuery,
  SearchCountriesQueryInput,
  searchCountriesQuerySchema,
} from '@/features/countries/schemas/search-countries-schema.ts';
import { CursorPage } from '@/lib/pagination.ts';
import { Result } from '@/types/result.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { cacheLife } from 'next/cache';
import { verifySession } from '@/lib/auth/session.ts';

export async function searchCountries(
  query: SearchCountriesQueryInput
): Promise<Result<CursorPage<CountrySummary>>> {
  await verifySession();
  const parsed = zodValidate(query, searchCountriesQuerySchema);
  if (!parsed.success) {
    return parsed;
  }

  return searchCountriesQuery(parsed.data);
}

export async function searchCountriesQuery({
  search,
  cursor,
  limit,
}: SearchCountriesQuery): Promise<Result<CursorPage<CountrySummary>>> {
  'use cache';
  cacheLife('days');

  let dbQuery = db.Country.orderBy((c) => c.name.asc()).limit(limit + 1);
  if (cursor) {
    dbQuery = dbQuery.cursor({ name: cursor });
  }
  dbQuery = dbQuery.where(buildSearch(search, COUNTRY_SEARCH_COLUMNS));

  const countries = await dbQuery.all();

  const hasMore = countries.length > limit;
  const items = hasMore ? countries.slice(0, limit) : countries;
  const nextCursor = hasMore ? items[items.length - 1].name : null;
  return {
    success: true,
    data: { items, nextCursor },
  };
}
