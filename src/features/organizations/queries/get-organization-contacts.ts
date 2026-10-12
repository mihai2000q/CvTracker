import 'server-only';
import { z } from 'zod';
import { cacheTag } from 'next/cache';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { Result } from '@/types/result.ts';
import { ContactSummary } from '@/features/organizations/types/contact.ts';

export async function getOrganizationContacts(
  organizationId: string
): Promise<Result<ContactSummary[]>> {
  const userId = getUserId(await verifySession());
  const parsed = zodValidate(organizationId, z.uuid());
  if (!parsed.success) {
    return parsed;
  }

  return { success: true, data: await getOrganizationContactsQuery(userId, parsed.data) };
}

async function getOrganizationContactsQuery(
  userId: string,
  organizationId: string
): Promise<ContactSummary[]> {
  'use cache';
  cacheTag(cacheTags.contacts(organizationId));

  const organization = await db.Organization.first({
    id: uuid(organizationId),
    userId: uuid(userId),
  });
  if (!organization) return [];

  return db.Contact.select('id', 'name', 'role')
    .where({ organizationId: uuid(organizationId) })
    .orderBy((c) => c.name.asc())
    .all();
}
