'use server';

import { z } from 'zod';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { constraintViolationReply } from '@database/sql-error.ts';
import { updateTag } from 'next/cache';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { Result } from '@/types/result.ts';

// Deletes the organization together with its job applications: the database keeps the two
// apart (the foreign key restricts), so the applications have to go first
export async function deleteOrganization(organizationId: string): Promise<Result<undefined>> {
  const session = await verifySession();

  if (!z.uuid().safeParse(organizationId).success) {
    return { success: false, errors: { id: ['Organization not found'] } };
  }

  let deleted;
  let deletedJobApplications;
  try {
    deletedJobApplications = await db.JobApplication.where({
      organizationId: uuid(organizationId),
    }).deleteAll();
    deleted = await db.Organization.where({ id: uuid(organizationId) }).delete();
  } catch (error) {
    const reply = constraintViolationReply(error);
    if (reply) return { success: false, errors: reply };
    throw error;
  }
  if (!deleted) return { success: false, errors: { id: ['Organization not found'] } };

  const userId = getUserId(session);
  updateTag(cacheTags.organizations(userId));
  if (deletedJobApplications.length > 0) {
    updateTag(cacheTags.jobApplications(userId));
  }
  return { success: true, data: undefined };
}
