import { all, or } from '@prisma/orm-postgres/orm-client';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { paginate } from '@database/paginate.ts';
import { buildOrderBy } from '@database/sort.ts';
import { Page } from '@/lib/pagination.ts';
import { Result } from '@/types/result.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import {
  GetJobApplicationSummariesQuery,
  GetJobApplicationSummariesQueryInput,
  getJobApplicationSummariesQuerySchema,
} from '@/features/job-applications/schemas/get-job-application-summaries-schema.ts';
import {
  JobApplicationSummary,
  toJobApplicationSummary,
} from '@/features/job-applications/types/job-application-summary.ts';
import {
  DEFAULT_JOB_APPLICATION_SORT_BY,
  JOB_APPLICATION_TIEBREAKERS,
  jobApplicationSorters,
} from '@/features/job-applications/constants/job-application-sorting.ts';

export async function getJobApplicationSummaries(
  query: GetJobApplicationSummariesQueryInput
): Promise<Result<Page<JobApplicationSummary>>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(query, getJobApplicationSummariesQuerySchema);
  if (!parsed.success) {
    return parsed;
  }

  return { success: true, data: await getJobApplicationSummariesQuery(userId, parsed.data) };
}

async function getJobApplicationSummariesQuery(
  userId: string,
  { countryId, documentId, organizationId, page, pageSize }: GetJobApplicationSummariesQuery
): Promise<Page<JobApplicationSummary>> {
  'use cache';
  cacheTag(cacheTags.jobApplications(userId), cacheTags.organizations(userId));

  const filteredQuery = db.JobApplication.where({ userId: uuid(userId) })
    .where((ja) => (countryId ? ja.countryId.eq(uuid(countryId)) : all()))
    .where((ja) => (organizationId ? ja.organizationId.eq(uuid(organizationId)) : all()))
    .where((ja) =>
      documentId
        ? or(ja.cvDocumentId.eq(uuid(documentId)), ja.coverLetterDocumentId.eq(uuid(documentId)))
        : all()
    );

  const modelsQuery = paginate(filteredQuery, { page, pageSize })
    .orderBy(
      buildOrderBy(
        DEFAULT_JOB_APPLICATION_SORT_BY,
        jobApplicationSorters,
        JOB_APPLICATION_TIEBREAKERS
      )
    )
    .select('id', 'title', 'currentStatus', 'appliedAt', 'postingUrl')
    .include('organization', (o) => o.select('id', 'name'))
    .include('country', (c) => c.select('id', 'name', 'isoCode'))
    .include('interviewRounds', (r) =>
      r.include('contacts', (rc) => rc.include('contact')).orderBy((r) => r.scheduledAt.asc())
    )
    .all();
  const [models, { totalCount }] = await Promise.all([
    modelsQuery,
    filteredQuery.aggregate((aggregate) => ({ totalCount: aggregate.count() })),
  ]);

  return { items: models.map(toJobApplicationSummary), totalCount };
}
