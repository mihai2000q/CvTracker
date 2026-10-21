import 'server-only';
import { Country } from '@/features/countries/types/country.ts';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import {
  GetCountriesQuery,
  GetCountriesQueryInput,
  getCountriesQuerySchema,
} from '@/features/countries/schemas/get-countries-schema.ts';
import {
  COUNTRY_TIEBREAKERS,
  countrySorters,
} from '@/features/countries/constants/country-sorting.tsx';
import { Page } from '@/lib/pagination.ts';
import { Result } from '@/types/result.ts';
import { paginate } from '@database/paginate.ts';
import { buildOrderBy } from '@database/sort.ts';
import { buildSearch } from '@database/filter.ts';
import {
  COUNTRY_SEARCH_COLUMNS,
  countryScopeWhere,
} from '@/features/countries/constants/country-filtering.ts';
import { zodValidate } from '@/lib/zod/parse.ts';

export async function getCountries(query: GetCountriesQueryInput): Promise<Result<Page<Country>>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(query, getCountriesQuerySchema);
  if (!parsed.success) {
    return parsed;
  }

  return { success: true, data: await getCountriesQuery(userId, parsed.data) };
}

async function getCountriesQuery(
  userId: string,
  { page, pageSize, sortBy, scope, search }: GetCountriesQuery
): Promise<Page<Country>> {
  'use cache';
  cacheTag(cacheTags.organizations(userId), cacheTags.jobApplications(userId));

  const filteredQuery = db.Country.where(countryScopeWhere(scope, userId)).where(
    buildSearch(search, COUNTRY_SEARCH_COLUMNS)
  );

  const modelsQuery = paginate(filteredQuery, { page, pageSize })
    .orderBy(buildOrderBy(sortBy, countrySorters(userId), COUNTRY_TIEBREAKERS))
    .include('jobApplications', (ja) => ja.where({ userId: uuid(userId) }).count())
    .include('organizationCountries', (oc) =>
      oc.where((x) => x.organization.some((o) => o.userId.eq(uuid(userId)))).count()
    )
    .all();
  const [models, { totalCount }] = await Promise.all([
    modelsQuery,
    filteredQuery.aggregate((aggregate) => ({ totalCount: aggregate.count() })),
  ]);

  const countries = models.map((country) => ({
    id: country.id,
    name: country.name,
    isoCode: country.isoCode,
    jobApplicationsCount: country.jobApplications,
    organizationsCount: country.organizationCountries,
  }));

  return { items: countries, totalCount };
}
