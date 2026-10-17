import 'server-only';
import { dbClient } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { InterviewOutcome as DbInterviewOutcome } from '@database/enums.ts';
import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';
import { StatusChangeEffect } from '@/features/job-applications/constants/job-application-statuses.ts';
import { RoundType } from '@/features/job-applications/types/enums/round-type.ts';

type Transaction = Parameters<Parameters<typeof dbClient.transaction>[0]>[0]['orm']['public'];

// Cancels the interview rounds of an application that are still scheduled and have yet to
// happen, and says how many that was. The ones that were in the past are left alone: only the
// user knows how they went
export async function cancelUpcomingRounds(
  tx: Transaction,
  jobApplicationId: string
): Promise<number> {
  const cancelled = await tx.InterviewRound.where({
    jobApplicationId: uuid(jobApplicationId),
    outcome: DbInterviewOutcome.members.Scheduled,
  })
    .where((round) => round.scheduledAt.gt(new Date().toISOString()))
    .updateAll({ outcome: DbInterviewOutcome.members.Cancelled });

  return cancelled.length;
}

// The next interview round, the earliest one still waiting for an outcome, is the one a decision
// on the application is about: it gets the outcome that decision means. The rounds after it are
// not touched here
async function settleNextRound(
  tx: Transaction,
  jobApplicationId: string,
  outcome: InterviewOutcome.Passed | InterviewOutcome.Failed
): Promise<StatusChangeEffect['settledRound']> {
  const [next] = await tx.InterviewRound.where({
    jobApplicationId: uuid(jobApplicationId),
    outcome: DbInterviewOutcome.members.Scheduled,
  })
    .orderBy((round) => round.scheduledAt.asc())
    .all();
  if (!next) return null;

  await tx.InterviewRound.where({ id: next.id }).update({
    outcome:
      outcome === InterviewOutcome.Failed
        ? DbInterviewOutcome.members.Failed
        : DbInterviewOutcome.members.Passed,
  });
  return { roundType: next.roundType as RoundType, outcome };
}

// A rejection fails the next round, and the ones still to come after it won't happen. When a
// round already failed it is what the rejection was about, so none is failed on top of it: the
// ones still to come are only cancelled
export async function settleRoundsOnRejection(
  tx: Transaction,
  jobApplicationId: string
): Promise<StatusChangeEffect> {
  const { failedRounds } = await tx.InterviewRound.where({
    jobApplicationId: uuid(jobApplicationId),
    outcome: DbInterviewOutcome.members.Failed,
  }).aggregate((aggregate) => ({ failedRounds: aggregate.count() }));

  return {
    settledRound:
      failedRounds > 0
        ? null
        : await settleNextRound(tx, jobApplicationId, InterviewOutcome.Failed),
    cancelledRounds: await cancelUpcomingRounds(tx, jobApplicationId),
  };
}

// An offer passes the next round. The ones after it are left: they may still be part of it
export async function settleRoundsOnOffer(
  tx: Transaction,
  jobApplicationId: string
): Promise<StatusChangeEffect> {
  return {
    settledRound: await settleNextRound(tx, jobApplicationId, InterviewOutcome.Passed),
    cancelledRounds: 0,
  };
}
