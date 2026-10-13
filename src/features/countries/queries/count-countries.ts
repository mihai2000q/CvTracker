import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import type { CountryScope } from '@/features/countries/constants/country-filtering.ts';

// The countries the user has applied to, or every country
export async function countCountries(scope: CountryScope = 'applied'): Promise<number> {
  const userId = getUserId(await verifySession());
  return countCountriesQuery(userId, scope);
}

async function countCountriesQuery(userId: string, scope: CountryScope): Promise<number> {
  'use cache';
  cacheTag(cacheTags.countries(userId), cacheTags.jobApplications(userId));

  const countries =
    scope === 'applied'
      ? db.Country.where((c) => c.jobApplications.some((ja) => ja.userId.eq(uuid(userId))))
      : db.Country;
  const { total } = await countries.aggregate((aggregate) => ({ total: aggregate.count() }));
  return total;
}
