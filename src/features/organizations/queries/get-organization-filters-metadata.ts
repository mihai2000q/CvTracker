import 'server-only';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { OrganizationFiltersMetadata } from '@/features/organizations/types/organization-filters-metadata.ts';

export async function getOrganizationFiltersMetadata(): Promise<OrganizationFiltersMetadata> {
  const userId = getUserId(await verifySession());
  return getOrganizationFiltersMetadataQuery(userId);
}

async function getOrganizationFiltersMetadataQuery(
  userId: string
): Promise<OrganizationFiltersMetadata> {
  'use cache';
  cacheTag(cacheTags.organizations(userId));

  const countries = await db.Country.where((c) =>
    c.organizationCountries.some((oc) => oc.organization.some((o) => o.userId.eq(uuid(userId))))
  )
    .orderBy((c) => c.name.asc())
    .all();

  return { countries: countries.map(({ id, name, isoCode }) => ({ id, name, isoCode })) };
}
