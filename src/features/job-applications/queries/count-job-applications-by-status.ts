import 'server-only';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import type { JobApplicationStatusCounts } from '@/features/job-applications/types/job-application-status-counts.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

export async function countJobApplicationsByStatus(): Promise<JobApplicationStatusCounts> {
  const userId = getUserId(await verifySession());
  return countJobApplicationsByStatusQuery(userId);
}

async function countJobApplicationsByStatusQuery(
  userId: string
): Promise<JobApplicationStatusCounts> {
  'use cache';
  cacheTag(cacheTags.jobApplications(userId));

  const counts = Object.fromEntries(
    Object.values(JobApplicationStatus).map((status) => [status, 0])
  ) as JobApplicationStatusCounts;

  const groups = await db.JobApplication.where({ userId: uuid(userId) })
    .groupBy('currentStatus')
    .aggregate((aggregate) => ({ total: aggregate.count() }));

  groups.forEach(({ currentStatus, total }) => {
    counts[currentStatus as JobApplicationStatus] = total;
  });

  return counts;
}
