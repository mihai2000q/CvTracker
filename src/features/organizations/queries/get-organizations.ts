import { Organization } from '@/features/organizations/types/organization.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import {
  GetOrganizationsQueryInput,
  getOrganizationsQuerySchema,
  GetOrganizationsQuery,
} from '@/features/organizations/schemas/get-organizations-schema.ts';
import { Page } from '@/types/pagination.ts';
import { Result } from '@/types/result.ts';
import { paginate } from '@database/paginate.ts';
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
  { page, pageSize }: GetOrganizationsQuery
): Promise<Page<Organization>> {
  'use cache';
  cacheTag(cacheTags.organizations(userId));

  const modelsQuery = paginate(db.Organization, { page, pageSize })
    .where({ userId: uuid(userId) })
    .orderBy((o) => o.createdAt.desc())
    .include('organizationCountries', (oc) => oc.include('country'))
    .include('jobApplications', (jobApplications) =>
      jobApplications.combine({
        items: jobApplications
          .select('id', 'title', 'currentStatus', 'appliedAt')
          .orderBy((j) => j.appliedAt.desc()),
        lastActivityAt: jobApplications.max('updatedAt'),
      })
    )
    .all();
  const [models, { totalCount }] = await Promise.all([
    modelsQuery,
    db.Organization.where({ userId: uuid(userId) }).aggregate((aggregate) => ({
      totalCount: aggregate.count(),
    })),
  ]);

  const organizations = models.map((organization) => ({
    id: organization.id,
    name: organization.name,
    websiteUrl: organization.websiteUrl,
    notes: organization.notes,
    countries: organization.organizationCountries.map(({ country }) => ({ ...country })),
    jobApplications: organization.jobApplications.items.map((jobApplication) => ({
      ...jobApplication,
      currentStatus: jobApplication.currentStatus as JobApplicationStatus,
      appliedAt: jobApplication.appliedAt.toString(),
    })),
    lastActivityAt: organization.jobApplications.lastActivityAt ?? organization.updatedAt,
  }));

  return { items: organizations, totalCount };
}
