'use server';

import { z } from 'zod';
import { updateTag } from 'next/cache';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { Result } from '@/types/result.ts';

// The contacts of the round are only unlinked from it: the database cascades the link, and the
// contacts stay
export async function deleteInterviewRound(interviewRoundId: string): Promise<Result<undefined>> {
  const userId = getUserId(await verifySession());

  if (!z.uuid().safeParse(interviewRoundId).success) {
    return { success: false, errors: { id: ['Interview round not found'] } };
  }

  const deleted = await db.InterviewRound.where({ id: uuid(interviewRoundId) }).delete();
  if (!deleted) return { success: false, errors: { id: ['Interview round not found'] } };

  updateTag(cacheTags.jobApplications(userId));
  return { success: true, data: undefined };
}
