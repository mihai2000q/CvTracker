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
  GetCountryJobApplicationsQuery,
  GetCountryJobApplicationsQueryInput,
  getCountryJobApplicationsQuerySchema,
} from '@/features/countries/schemas/get-country-job-applications-schema.ts';
import type { CountryJobApplication } from '@/features/countries/types/country-job-application.ts';
import {
  DEFAULT_JOB_APPLICATION_SORT_BY,
  JOB_APPLICATION_TIEBREAKERS,
  jobApplicationSorters,
} from '@/features/job-applications/constants/job-application-sorting.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { toInterviewRound } from '@/features/job-applications/types/interview-round.ts';

export async function getCountryJobApplications(
  query: GetCountryJobApplicationsQueryInput
): Promise<Result<Page<CountryJobApplication>>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(query, getCountryJobApplicationsQuerySchema);
  if (!parsed.success) {
    return parsed;
  }

  return { success: true, data: await getCountryJobApplicationsQuery(userId, parsed.data) };
}

async function getCountryJobApplicationsQuery(
  userId: string,
  { countryId, page, pageSize }: GetCountryJobApplicationsQuery
): Promise<Page<CountryJobApplication>> {
  'use cache';
  cacheTag(cacheTags.jobApplications(userId), cacheTags.organizations(userId));

  const filteredQuery = db.JobApplication.where({
    userId: uuid(userId),
    countryId: uuid(countryId),
  });

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
    .include('interviewRounds', (r) =>
      r.include('contacts', (rc) => rc.include('contact')).orderBy((r) => r.scheduledAt.asc())
    )
    .all();
  const [models, { totalCount }] = await Promise.all([
    modelsQuery,
    filteredQuery.aggregate((aggregate) => ({ totalCount: aggregate.count() })),
  ]);

  const jobApplications = models.map((jobApplication) => ({
    id: jobApplication.id,
    title: jobApplication.title,
    currentStatus: jobApplication.currentStatus as JobApplicationStatus,
    appliedAt: jobApplication.appliedAt.toString(),
    postingUrl: jobApplication.postingUrl,
    organization: { id: jobApplication.organization!.id, name: jobApplication.organization!.name },
    interviewRounds: jobApplication.interviewRounds.map(toInterviewRound),
  }));

  return { items: jobApplications, totalCount };
}
