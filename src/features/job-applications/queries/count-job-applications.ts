import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';

export async function countJobApplications(): Promise<number> {
  const userId = getUserId(await verifySession());
  return countJobApplicationsQuery(userId);
}

async function countJobApplicationsQuery(userId: string): Promise<number> {
  'use cache';
  cacheTag(cacheTags.jobApplications(userId));

  const { total } = await db.JobApplication.where({ userId: uuid(userId) }).aggregate(
    (aggregate) => ({ total: aggregate.count() })
  );
  return total;
}
