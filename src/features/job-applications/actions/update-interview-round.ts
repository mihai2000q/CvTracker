'use server';

import { updateTag } from 'next/cache';
import { db, dbClient } from '@database/db';
import { uuid } from '@database/field-values';
import { RoundType as DbRoundType } from '@database/enums';
import { isForeignKeyConstraintError } from '@database/sql-error';
import { getUserId, verifySession } from '@/lib/auth/session';
import type { SubmissionResult } from '@conform-to/react';
import { zodValidateForm } from '@/lib/zod/parse.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { updateInterviewRoundSchema } from '@/features/job-applications/schemas/update-interview-round-schema.ts';
import { RoundType } from '@/features/job-applications/types/enums/round-type.ts';

const DB_ROUND_TYPES = {
  [RoundType.IntroCall]: DbRoundType.members.IntroCall,
  [RoundType.Technical]: DbRoundType.members.Technical,
  [RoundType.Coding]: DbRoundType.members.Coding,
  [RoundType.TakeHome]: DbRoundType.members.TakeHome,
  [RoundType.Behavioral]: DbRoundType.members.Behavioral,
};

// Its outcome is set apart, and the status of the application is not touched
export async function updateInterviewRound(
  _state: SubmissionResult | undefined,
  formData: FormData
) {
  const userId = getUserId(await verifySession());

  const submission = zodValidateForm({ formData, schema: updateInterviewRoundSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { id, roundType, date, time, timeZone, contactIds, notes } = submission.value;

  const existing = await db.InterviewRound.first({ id: uuid(id) });
  if (!existing) {
    return submission.reply({ formErrors: ['Interview round not found'] });
  }

  try {
    await dbClient.transaction(async ({ orm }) => {
      const tx = orm.public;

      await tx.InterviewRound.where({ id: uuid(id) }).update({
        roundType: DB_ROUND_TYPES[roundType],
        scheduledAt: Temporal.PlainDateTime.from(`${date}T${time}`)
          .toZonedDateTime(timeZone)
          .toInstant()
          .toString(),
        notes: notes ?? null,
      });
      // The contacts are replaced as a whole: the ones left out go, the new ones come
      await tx.InterviewRoundHasContact.where({ interviewRoundId: uuid(id) }).deleteAll();
      await tx.InterviewRoundHasContact.createAll(
        [...new Set(contactIds)].map((contactId) => ({
          interviewRoundId: uuid(id),
          contactId: uuid(contactId),
        }))
      );
    });
  } catch (error) {
    if (isForeignKeyConstraintError(error)) {
      return submission.reply({ formErrors: ['One of the selected contacts no longer exists.'] });
    }
    throw error;
  }

  updateTag(cacheTags.jobApplications(userId));
  return submission.reply({ resetForm: true });
}
