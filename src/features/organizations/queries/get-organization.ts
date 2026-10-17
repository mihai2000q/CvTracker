import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { z } from 'zod';
import { zodValidate } from '@/lib/zod/parse.ts';
import { Result } from '@/types/result.ts';
import {
  OrganizationDetail,
  toOrganizationSummary,
} from '@/features/organizations/types/organization.ts';

export async function getOrganization(id: string): Promise<Result<OrganizationDetail | null>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(id, z.uuid());
  if (!parsed.success) {
    return parsed;
  }

  return { success: true, data: await getOrganizationQuery(userId, parsed.data) };
}

async function getOrganizationQuery(
  userId: string,
  id: string
): Promise<OrganizationDetail | null> {
  'use cache';
  cacheTag(cacheTags.organizations(userId), cacheTags.jobApplications(userId));

  const [organization] = await db.Organization.where({ id: uuid(id), userId: uuid(userId) })
    .include('organizationCountries', (oc) =>
      oc.include('country').orderBy((c) => c.country.name.asc())
    )
    .include('jobApplications', (ja) => ja.count())
    .all();

  if (!organization) {
    return null;
  }

  return {
    ...toOrganizationSummary(organization),
    websiteUrl: organization.websiteUrl,
    notes: organization.notes,
    jobApplicationsCount: organization.jobApplications,
  };
}
