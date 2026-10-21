import 'server-only';
import { db } from '@database/db.ts';
import { Result } from '@/types/result.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import {
  OrganizationSummary,
  toOrganizationSummary,
} from '@/features/organizations/types/organization.ts';
import {
  SearchOrganizationsQuery,
  SearchOrganizationsQueryInput,
  searchOrganizationsQuerySchema,
} from '@/features/organizations/schemas/search-organizations-schema.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { uuid } from '@database/field-values.ts';
import { buildSearch } from '@database/filter.ts';
import { ORGANIZATION_SEARCH_COLUMNS } from '@/features/organizations/constants/organization-filtering.ts';
import { CursorPage, decodeCursor, encodeCursor } from '@/lib/pagination.ts';

export async function searchOrganizations(
  query: SearchOrganizationsQueryInput
): Promise<Result<CursorPage<OrganizationSummary>>> {
  const userId = getUserId(await verifySession());
  const parsed = zodValidate(query, searchOrganizationsQuerySchema);
  if (!parsed.success) {
    return parsed;
  }

  return searchOrganizationsQuery(userId, parsed.data);
}

export async function searchOrganizationsQuery(
  userId: string,
  { search, cursor, limit }: SearchOrganizationsQuery
): Promise<Result<CursorPage<OrganizationSummary>>> {
  'use cache';
  cacheTag(cacheTags.organizations(userId));

  let dbQuery = db.Organization.select('id', 'name', 'updatedAt')
    .where({ userId: uuid(userId) })
    .orderBy([(c) => c.updatedAt.desc(), (c) => c.name.asc(), (c) => c.id.asc()])
    .include('organizationCountries', (oc) =>
      oc.include('country').orderBy((c) => c.country.name.asc())
    )
    .limit(limit + 1);
  const decoded = cursor ? decodeCursor(cursor, 3) : null;
  if (decoded) {
    const [updatedAt, name, id] = decoded;
    dbQuery = dbQuery.cursor({ updatedAt, name, id: uuid(id) });
  }
  dbQuery = dbQuery.where(buildSearch(search, ORGANIZATION_SEARCH_COLUMNS));

  const organizations = await dbQuery.all();

  const hasMore = organizations.length > limit;
  const models = hasMore ? organizations.slice(0, limit) : organizations;
  const last = models[models.length - 1];
  const nextCursor = hasMore ? encodeCursor(last.updatedAt, last.name, last.id) : null;

  const items: OrganizationSummary[] = models.map(toOrganizationSummary);

  return {
    success: true,
    data: { items, nextCursor },
  };
}
