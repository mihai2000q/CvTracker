import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';

export async function countOrganizations(): Promise<number> {
  const userId = getUserId(await verifySession());
  return countOrganizationsQuery(userId);
}

async function countOrganizationsQuery(userId: string): Promise<number> {
  'use cache';
  cacheTag(cacheTags.organizations(userId));

  const { total } = await db.Organization.where({ userId: uuid(userId) }).aggregate(
    (aggregate) => ({ total: aggregate.count() })
  );
  return total;
}
