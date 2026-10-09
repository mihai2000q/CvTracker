import 'server-only';
import { or } from '@prisma/orm-postgres/orm-client';
import { db } from '@database/db.ts';
import { CursorPage } from '@/types/pagination.ts';
import { Result } from '@/types/result.ts';
import { zodValidate } from '@/lib/zod.ts';
import { OrganizationSummary } from '@/features/organizations/types/organization.ts';
import {
  SearchOrganizationsQuery,
  SearchOrganizationsQueryInput,
  searchOrganizationsQuerySchema,
} from '@/features/organizations/schemas/search-organizations-schema.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { uuid } from '@database/field-values.ts';

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

  let dbQuery = db.Organization.where({ userId: uuid(userId) })
    .orderBy((c) => c.name.asc())
    .limit(limit + 1);
  if (cursor) {
    dbQuery = dbQuery.cursor({ name: cursor });
  }
  if (search && search !== '') {
    dbQuery = dbQuery.where((c) => or(c.name.ilike(`%${search}%`)));
  }

  const countries = await dbQuery.all();

  const hasMore = countries.length > limit;
  const items = hasMore ? countries.slice(0, limit) : countries;
  const nextCursor = hasMore ? items[items.length - 1].name : null;
  return {
    success: true,
    data: { items, nextCursor },
  };
}
