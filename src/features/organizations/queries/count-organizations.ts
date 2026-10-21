import 'server-only';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

export async function countOrganizations(statuses?: JobApplicationStatus[]): Promise<number> {
  const userId = getUserId(await verifySession());
  return countOrganizationsQuery(userId, statuses);
}

async function countOrganizationsQuery(
  userId: string,
  statuses?: JobApplicationStatus[]
): Promise<number> {
  'use cache';
  cacheTag(cacheTags.organizations(userId));
  if (statuses) cacheTag(cacheTags.jobApplications(userId));

  const organizations = db.Organization.where({ userId: uuid(userId) });
  const { total } = await (
    statuses
      ? organizations.where((o) => o.jobApplications.some((j) => j.currentStatus.in(statuses)))
      : organizations
  ).aggregate((aggregate) => ({ total: aggregate.count() }));
  return total;
}
