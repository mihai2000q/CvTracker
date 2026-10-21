import 'server-only';
import { db } from '@database/db.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import {
  countryScopeWhere,
  type CountryScope,
} from '@/features/countries/constants/country-filtering.ts';

// The countries the user has applied to, or every country
export async function countCountries(scope: CountryScope = 'applied'): Promise<number> {
  const userId = getUserId(await verifySession());
  return countCountriesQuery(userId, scope);
}

async function countCountriesQuery(userId: string, scope: CountryScope): Promise<number> {
  'use cache';
  cacheTag(cacheTags.jobApplications(userId));

  const { total } = await db.Country.where(countryScopeWhere(scope, userId)).aggregate(
    (aggregate) => ({ total: aggregate.count() })
  );
  return total;
}
