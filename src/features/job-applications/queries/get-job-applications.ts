import {
  JobApplication,
  toJobApplicationSummary,
} from '@/features/job-applications/types/job-application.ts';
import { toOrganizationSummary } from '@/features/organizations/types/organization.ts';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import {
  GetJobApplicationsQuery,
  GetJobApplicationsQueryInput,
  getJobApplicationsQuerySchema,
} from '@/features/job-applications/schemas/get-job-applications-schema.ts';
import { Page } from '@/lib/pagination.ts';
import { Result } from '@/types/result.ts';
import { paginate } from '@database/paginate.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { toDocumentSummary } from '@/features/documents/types/document.ts';

export async function getJobApplications(
  query: GetJobApplicationsQueryInput
): Promise<Result<Page<JobApplication>>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(query, getJobApplicationsQuerySchema);
  if (!parsed.success) {
    return parsed;
  }

  return { success: true, data: await getJobApplicationsQuery(userId, parsed.data) };
}

async function getJobApplicationsQuery(
  userId: string,
  { page, pageSize }: GetJobApplicationsQuery
): Promise<Page<JobApplication>> {
  'use cache';
  cacheTag(
    cacheTags.jobApplications(userId),
    cacheTags.organizations(userId),
    cacheTags.documents(userId)
  );

  const filteredQuery = db.JobApplication.where({ userId: uuid(userId) });

  const modelsQuery = paginate(filteredQuery, { page, pageSize })
    .orderBy((o) => o.appliedAt.desc())
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
    .all();
  const [models, { totalCount }] = await Promise.all([
    modelsQuery,
    filteredQuery.aggregate((aggregate) => ({ totalCount: aggregate.count() })),
  ]);

  const jobApplications = models.map((jobApplication) => ({
    ...toJobApplicationSummary(jobApplication, toOrganizationSummary(jobApplication.organization!)),
    notes: jobApplication.notes,
    coverLetter: jobApplication.coverLetterDocument
      ? toDocumentSummary(jobApplication.coverLetterDocument)
      : undefined,
  }));

  return { items: jobApplications, totalCount };
}
