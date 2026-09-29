import 'server-only';
import { or } from '@prisma/orm-postgres/orm-client';
import { db } from '@database/db.ts';
import { CountrySummary } from '@/features/countries/types/country.ts';
import {
  SearchCountriesQuery,
  searchCountriesQuerySchema,
} from '@/features/countries/schemas/search-countries-schema.ts';
import { CursorPage } from '@/types/pagination.ts';
import { Result } from '@/types/result.ts';
import { zodValidate } from '@/lib/zod.ts';

export async function searchCountries(
  query: SearchCountriesQuery
): Promise<Result<CursorPage<CountrySummary>>> {
  const parsed = zodValidate(query, searchCountriesQuerySchema);
  if (!parsed.success) {
    return parsed;
  }
  const { search, cursor, limit } = parsed.data;

  let dbQuery = db.Country.orderBy((c) => c.name.asc()).limit(limit + 1);
  if (cursor) {
    dbQuery = dbQuery.cursor({ name: cursor });
  }
  if (search && search !== '') {
    dbQuery = dbQuery.where((c) =>
      or(c.name.ilike(`%${search}%`), c.isoCode.ilike(`%${search}%`))
    );
  }

  const countries = await dbQuery.all();

  const hasMore = countries.length > limit;
  const items = hasMore ? countries.slice(0, limit) : countries;
  const nextCursor = hasMore ? items[items.length - 1].name : null;
  return {
    success: true,
    data: { items, nextCursor },
  };
}
