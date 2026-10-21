import 'server-only';
import { db } from '@database/db.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheLife, cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { findStaleJobApplications } from '@/features/job-applications/lifecycle/ghosting.ts';
import type { StaleJobApplication } from '@/features/job-applications/types/job-application.ts';

export async function getStaleJobApplications(): Promise<StaleJobApplication[]> {
  const userId = getUserId(await verifySession());
  return getStaleJobApplicationsQuery(userId);
}

async function getStaleJobApplicationsQuery(userId: string): Promise<StaleJobApplication[]> {
  'use cache';
  // Time makes an application silent without a write, so the list is only good for a while
  cacheTag(cacheTags.jobApplications(userId));
  cacheLife('hours');

  return findStaleJobApplications(db, userId);
}
