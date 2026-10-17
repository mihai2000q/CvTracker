import { Country } from '@/features/countries/types/country.ts';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { z } from 'zod';
import { zodValidate } from '@/lib/zod/parse.ts';
import { Result } from '@/types/result.ts';

export async function getCountry(id: string): Promise<Result<Country | null>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(id, z.uuid());
  if (!parsed.success) {
    return parsed;
  }

  return { success: true, data: await getCountryQuery(userId, parsed.data) };
}

async function getCountryQuery(userId: string, id: string): Promise<Country | null> {
  'use cache';
  cacheTag(cacheTags.organizations(userId), cacheTags.jobApplications(userId));

  const [country] = await db.Country.where({ id: uuid(id) })
    .include('jobApplications', (ja) => ja.where({ userId: uuid(userId) }).count())
    .include('organizationCountries', (oc) =>
      oc.where((x) => x.organization.some((o) => o.userId.eq(uuid(userId)))).count()
    )
    .all();

  if (!country) {
    return null;
  }

  return {
    id: country.id,
    name: country.name,
    isoCode: country.isoCode,
    jobApplicationsCount: country.jobApplications,
    organizationsCount: country.organizationCountries,
  };
}
