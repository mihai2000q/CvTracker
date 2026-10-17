'use server';

import { z } from 'zod';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { constraintViolationReply } from '@database/sql-error.ts';
import { updateTag } from 'next/cache';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { Result } from '@/types/result.ts';

export async function deleteContact(contactId: string): Promise<Result<undefined>> {
  const userId = getUserId(await verifySession());

  if (!z.uuid().safeParse(contactId).success) {
    return { success: false, errors: { id: ['Contact not found'] } };
  }

  let deleted;
  try {
    deleted = await db.Contact.where({ id: uuid(contactId) }).delete();
  } catch (error) {
    const reply = constraintViolationReply(error);
    if (reply) return { success: false, errors: reply };
    throw error;
  }
  if (!deleted) return { success: false, errors: { id: ['Contact not found'] } };

  updateTag(cacheTags.contacts(deleted.organizationId));
  updateTag(cacheTags.jobApplications(userId));
  return { success: true, data: undefined };
}
