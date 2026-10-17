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
  GetCountryOrganizationsQuery,
  GetCountryOrganizationsQueryInput,
  getCountryOrganizationsQuerySchema,
} from '@/features/countries/schemas/get-country-organizations-schema.ts';
import type { CountryOrganization } from '@/features/countries/types/country-organization.ts';
import { DEFAULT_COUNTRY_ORGANIZATION_SORT_BY } from '@/features/countries/constants/country-page.ts';
import {
  ORGANIZATION_TIEBREAKERS,
  organizationSorters,
} from '@/features/organizations/constants/organization-sorting.tsx';

export async function getCountryOrganizations(
  query: GetCountryOrganizationsQueryInput
): Promise<Result<Page<CountryOrganization>>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(query, getCountryOrganizationsQuerySchema);
  if (!parsed.success) {
    return parsed;
  }

  return { success: true, data: await getCountryOrganizationsQuery(userId, parsed.data) };
}

async function getCountryOrganizationsQuery(
  userId: string,
  { countryId, sortBy, page, pageSize }: GetCountryOrganizationsQuery
): Promise<Page<CountryOrganization>> {
  'use cache';
  cacheTag(cacheTags.organizations(userId), cacheTags.jobApplications(userId));

  const filteredQuery = db.Organization.where({ userId: uuid(userId) }).where((o) =>
    o.organizationCountries.some((oc) => oc.countryId.eq(uuid(countryId)))
  );

  const modelsQuery = paginate(filteredQuery, { page, pageSize })
    .orderBy(
      buildOrderBy(
        sortBy.length > 0 ? sortBy : DEFAULT_COUNTRY_ORGANIZATION_SORT_BY,
        organizationSorters,
        ORGANIZATION_TIEBREAKERS
      )
    )
    .include('jobApplications', (ja) =>
      ja.combine({
        inCountry: ja.where({ countryId: uuid(countryId) }).count(),
        total: ja.count(),
      })
    )
    .all();
  const [models, { totalCount }] = await Promise.all([
    modelsQuery,
    filteredQuery.aggregate((aggregate) => ({ totalCount: aggregate.count() })),
  ]);

  const organizations = models.map((organization) => ({
    id: organization.id,
    name: organization.name,
    websiteUrl: organization.websiteUrl,
    jobApplicationsCount: organization.jobApplications.inCountry,
    totalJobApplicationsCount: organization.jobApplications.total,
  }));

  return { items: organizations, totalCount };
}
