import 'server-only';
import { toOrganizationJobApplication } from '@/features/organizations/types/organization-job-application.ts';
import {
  Organization,
  toOrganizationSummary,
} from '@/features/organizations/types/organization.ts';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import {
  GetOrganizationsQuery,
  GetOrganizationsQueryInput,
  getOrganizationsQuerySchema,
} from '@/features/organizations/schemas/get-organizations-schema.ts';
import { Page } from '@/lib/pagination.ts';
import { Result } from '@/types/result.ts';
import { paginate } from '@database/paginate.ts';
import { buildOrderBy } from '@database/sort.ts';
import { buildSearch, buildWhere } from '@database/filter.ts';
import {
  ORGANIZATION_FILTERS,
  ORGANIZATION_SEARCH_COLUMNS,
} from '@/features/organizations/constants/organization-filtering.ts';
import {
  ORGANIZATION_TIEBREAKERS,
  organizationSorters,
} from '@/features/organizations/constants/organization-sorting.tsx';
import { JOB_APPLICATION_FILTERS } from '@/features/job-applications/constants/job-application-filtering.ts';
import { zodValidate } from '@/lib/zod/parse.ts';

export async function getOrganizations(
  query: GetOrganizationsQueryInput
): Promise<Result<Page<Organization>>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(query, getOrganizationsQuerySchema);
  if (!parsed.success) {
    return parsed;
  }

  return { success: true, data: await getOrganizationsQuery(userId, parsed.data) };
}

async function getOrganizationsQuery(
  userId: string,
  { page, pageSize, sortBy, filterBy, search }: GetOrganizationsQuery
): Promise<Page<Organization>> {
  'use cache';
  cacheTag(cacheTags.organizations(userId), cacheTags.jobApplications(userId));

  const filteredQuery = db.Organization.where({ userId: uuid(userId) })
    .where(buildWhere(filterBy, ORGANIZATION_FILTERS))
    .where(buildSearch(search, ORGANIZATION_SEARCH_COLUMNS));

  const modelsQuery = paginate(filteredQuery, { page, pageSize })
    .orderBy(buildOrderBy(sortBy, organizationSorters, ORGANIZATION_TIEBREAKERS))
    .include('organizationCountries', (oc) =>
      oc.include('country').orderBy((c) => c.country.name.asc())
    )
    .include('jobApplications', (allJobApplications) => {
      // Only the applications that have the status filtered by, when there is one
      const jobApplications = allJobApplications.where(
        buildWhere(
          filterBy.filter(({ field }) => field === 'status'),
          JOB_APPLICATION_FILTERS
        )
      );
      return jobApplications.combine({
        items: jobApplications
          .select('id', 'title', 'currentStatus', 'appliedAt', 'source', 'postingUrl')
          .include('country')
          .include('cvDocument')
          .include('interviewRounds', (r) =>
            r.include('contacts', (rc) => rc.include('contact')).orderBy((r) => r.scheduledAt.asc())
          )
          .orderBy((j) => j.appliedAt.desc()),
        // Of every application, not only those shown
        lastActivityAt: allJobApplications.max('updatedAt'),
      });
    })
    .all();
  const [models, { totalCount }] = await Promise.all([
    modelsQuery,
    filteredQuery.aggregate((aggregate) => ({ totalCount: aggregate.count() })),
  ]);

  const organizations = models.map((organization) => {
    const summary = toOrganizationSummary(organization);

    return {
      ...summary,
      websiteUrl: organization.websiteUrl,
      notes: organization.notes,
      jobApplications: organization.jobApplications.items.map((jobApplication) =>
        toOrganizationJobApplication(jobApplication)
      ),
      lastActivityAt: organization.jobApplications.lastActivityAt ?? organization.updatedAt,
    };
  });

  return { items: organizations, totalCount };
}
