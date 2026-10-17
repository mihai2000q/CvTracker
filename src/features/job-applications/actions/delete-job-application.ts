'use server';

import { z } from 'zod';
import { updateTag } from 'next/cache';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { constraintViolationReply } from '@database/sql-error.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { Result } from '@/types/result.ts';

// The interview rounds, the status history and the skills of the application go with it: the
// database cascades. Its documents and organization stay
export async function deleteJobApplication(jobApplicationId: string): Promise<Result<undefined>> {
  const userId = getUserId(await verifySession());

  if (!z.uuid().safeParse(jobApplicationId).success) {
    return { success: false, errors: { id: ['Job application not found'] } };
  }

  let deleted;
  try {
    deleted = await db.JobApplication.where({ id: uuid(jobApplicationId) }).delete();
  } catch (error) {
    const reply = constraintViolationReply(error);
    if (reply) return { success: false, errors: reply };
    throw error;
  }
  if (!deleted) return { success: false, errors: { id: ['Job application not found'] } };

  updateTag(cacheTags.jobApplications(userId));
  return { success: true, data: undefined };
}
