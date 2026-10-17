import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

export async function countOrganizations(status?: JobApplicationStatus): Promise<number> {
  const userId = getUserId(await verifySession());
  return countOrganizationsQuery(userId, status);
}

async function countOrganizationsQuery(
  userId: string,
  status?: JobApplicationStatus
): Promise<number> {
  'use cache';
  cacheTag(cacheTags.organizations(userId), cacheTags.jobApplications(userId));

  const organizations = db.Organization.where({ userId: uuid(userId) });
  const { total } = await (
    status
      ? organizations.where((o) => o.jobApplications.some((j) => j.currentStatus.eq(status)))
      : organizations
  ).aggregate((aggregate) => ({ total: aggregate.count() }));
  return total;
}
