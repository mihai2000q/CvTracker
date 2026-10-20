'use server';

import { z } from 'zod';
import { updateTag } from 'next/cache';
import { db, dbClient } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { InterviewOutcome as DbInterviewOutcome } from '@database/enums.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { Result } from '@/types/result.ts';
import { IN_PROGRESS_STATUSES } from '@/features/job-applications/constants/job-application-statuses.ts';
import { recordStatusChange } from '@/features/job-applications/services/record-status-change.ts';
import { ROUND_TYPE_LABELS } from '@/features/job-applications/constants/round-types.ts';
import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { RoundType } from '@/features/job-applications/types/enums/round-type.ts';
import { InterviewOutcomeEffect } from '@/features/job-applications/types/interview-outcome-effect.ts';

const setOutcomeSchema = z.object({
  interviewRoundId: z.uuid('Interview round is invalid'),
  outcome: z.enum(InterviewOutcome, 'Outcome is invalid'),
});

const DB_OUTCOMES = {
  [InterviewOutcome.Scheduled]: DbInterviewOutcome.members.Scheduled,
  [InterviewOutcome.Passed]: DbInterviewOutcome.members.Passed,
  [InterviewOutcome.Failed]: DbInterviewOutcome.members.Failed,
  [InterviewOutcome.Cancelled]: DbInterviewOutcome.members.Cancelled,
};

// A failed round rejects the application still in progress, unless another round is yet to
// take place: then it only says so, for the user to decide
export async function setInterviewOutcome(
  interviewRoundId: string,
  outcome: InterviewOutcome
): Promise<Result<InterviewOutcomeEffect>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate({ interviewRoundId, outcome }, setOutcomeSchema);
  if (!parsed.success) {
    return parsed;
  }

  const round = await db.InterviewRound.first({ id: uuid(interviewRoundId) });
  if (!round) return { success: false, errors: { id: ['Interview round not found'] } };
  const jobApplication = await db.JobApplication.first({ id: round.jobApplicationId });

  const effect: InterviewOutcomeEffect = { rejected: false, suggestRejection: false };

  await dbClient.transaction(async ({ orm }) => {
    const tx = orm.public;

    await tx.InterviewRound.where({ id: uuid(interviewRoundId) }).update({
      outcome: DB_OUTCOMES[outcome],
    });

    const endsInProgress =
      outcome === InterviewOutcome.Failed &&
      jobApplication &&
      IN_PROGRESS_STATUSES.includes(jobApplication.currentStatus);
    if (!endsInProgress) return;

    const { upcoming } = await tx.InterviewRound.where({
      jobApplicationId: round.jobApplicationId,
      outcome: DbInterviewOutcome.members.Scheduled,
    })
      .where((other) => other.scheduledAt.gt(new Date().toISOString()))
      .aggregate((aggregate) => ({ upcoming: aggregate.count() }));
    if (upcoming > 0) {
      effect.suggestRejection = true;
      return;
    }

    await recordStatusChange(
      tx,
      [round.jobApplicationId],
      JobApplicationStatus.Rejected,
      `${ROUND_TYPE_LABELS[round.roundType as RoundType]} round failed`
    );
    effect.rejected = true;
  });

  updateTag(cacheTags.jobApplications(userId));
  return { success: true, data: effect };
}
