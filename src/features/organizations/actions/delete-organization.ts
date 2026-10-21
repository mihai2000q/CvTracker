'use server';

import { z } from 'zod';
import { dbClient } from '@database/db.ts';
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
    // One transaction, so the applications are not lost when the organization can't be deleted
    ({ deleted, deletedJobApplications } = await dbClient.transaction(async ({ orm }) => {
      const tx = orm.public;

      const deletedJobApplications = await tx.JobApplication.where({
        organizationId: uuid(organizationId),
      }).deleteAll();
      const deleted = await tx.Organization.where({ id: uuid(organizationId) }).delete();
      return { deleted, deletedJobApplications };
    }));
  } catch (error) {
    const reply = constraintViolationReply(error);
    if (reply) return { success: false, errors: reply };
    throw error;
  }
  if (!deleted) return { success: false, errors: { id: ['Organization not found'] } };

  const userId = getUserId(session);
  updateTag(cacheTags.organizations(userId));
  updateTag(cacheTags.contacts(organizationId));
  if (deletedJobApplications.length > 0) {
    updateTag(cacheTags.jobApplications(userId));
  }
  return { success: true, data: undefined };
}
