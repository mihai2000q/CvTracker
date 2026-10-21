'use server';

import { updateTag } from 'next/cache';
import { db, dbClient } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { Result } from '@/types/result.ts';
import {
  NO_STATUS_CHANGE_EFFECT,
  STATUSES_THAT_CANCEL_UPCOMING_ROUNDS,
  type StatusChangeEffect,
} from '@/features/job-applications/constants/job-application-statuses.ts';
import {
  cancelUpcomingRounds,
  settleRoundsOnOffer,
  settleRoundsOnRejection,
} from '@/features/job-applications/services/cancel-upcoming-rounds.ts';
import {
  changeJobApplicationStatusSchema,
  ChangeJobApplicationStatusInput,
} from '@/features/job-applications/schemas/change-job-application-status-schema.ts';
import { recordStatusChange } from '@/features/job-applications/services/record-status-change.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

// Moves an application to a status and records the move, and why when it says, in its history.
// A status that ends the application cancels the interview rounds still to come, and the
// result says how many
export async function changeJobApplicationStatus(
  input: ChangeJobApplicationStatusInput
): Promise<Result<StatusChangeEffect>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(input, changeJobApplicationStatusSchema);
  if (!parsed.success) {
    return parsed;
  }
  const { jobApplicationId, status, note } = parsed.data;

  const jobApplication = await db.JobApplication.first({ id: uuid(jobApplicationId) });
  if (!jobApplication) {
    return { success: false, errors: { jobApplicationId: ['Job application not found'] } };
  }
  // Nothing moved, so nothing to record
  if (jobApplication.currentStatus === status) {
    return { success: true, data: NO_STATUS_CHANGE_EFFECT };
  }

  const effect = await dbClient.transaction(async ({ orm }) => {
    const tx = orm.public;

    await recordStatusChange(tx, [jobApplicationId], status, note);

    if (status === JobApplicationStatus.Offer) return settleRoundsOnOffer(tx, jobApplicationId);
    if (status === JobApplicationStatus.Rejected)
      return settleRoundsOnRejection(tx, jobApplicationId);
    if (STATUSES_THAT_CANCEL_UPCOMING_ROUNDS.includes(status)) {
      return {
        settledRound: null,
        cancelledRounds: await cancelUpcomingRounds(tx, jobApplicationId),
      };
    }
    return NO_STATUS_CHANGE_EFFECT;
  });

  updateTag(cacheTags.jobApplications(userId));
  return { success: true, data: effect };
}
