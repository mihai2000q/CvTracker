import 'server-only';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { z } from 'zod';
import { zodValidate } from '@/lib/zod/parse.ts';
import { Result } from '@/types/result.ts';
import { toOrganizationSummary } from '@/features/organizations/types/organization.ts';
import {
  JobApplicationDetail,
  toJobApplication,
  toStatusChange,
} from '@/features/job-applications/types/job-application.ts';

export async function getJobApplication(id: string): Promise<Result<JobApplicationDetail | null>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(id, z.uuid());
  if (!parsed.success) {
    return parsed;
  }

  return { success: true, data: await getJobApplicationQuery(userId, parsed.data) };
}

async function getJobApplicationQuery(
  userId: string,
  id: string
): Promise<JobApplicationDetail | null> {
  'use cache';
  cacheTag(
    cacheTags.jobApplications(userId),
    cacheTags.organizations(userId),
    cacheTags.documents(userId)
  );

  const [jobApplication] = await db.JobApplication.where({ id: uuid(id), userId: uuid(userId) })
    .include('organization', (o) =>
      o.include('organizationCountries', (oc) =>
        oc.include('country').orderBy((c) => c.country.name.asc())
      )
    )
    .include('country')
    .include('cvDocument')
    .include('coverLetterDocument')
    .include('interviewRounds', (r) =>
      r.include('contacts', (rc) => rc.include('contact')).orderBy((r) => r.scheduledAt.asc())
    )
    .include('statusHistory', (h) => h.orderBy((h) => h.changedAt.desc()))
    .all();

  if (!jobApplication) {
    return null;
  }

  return {
    ...toJobApplication(jobApplication, toOrganizationSummary(jobApplication.organization!)),
    statusHistory: jobApplication.statusHistory.map(toStatusChange),
  };
}
