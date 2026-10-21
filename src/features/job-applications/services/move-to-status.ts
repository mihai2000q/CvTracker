import 'server-only';
import { dbClient } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import {
  NO_STATUS_CHANGE_EFFECT,
  STATUSES_THAT_CANCEL_UPCOMING_ROUNDS,
  type StatusChangeEffect,
} from '@/features/job-applications/constants/job-application-statuses.ts';
import { recordStatusChange } from '@/features/job-applications/services/record-status-change.ts';
import {
  applyRoundChanges,
  readRoundsOf,
  type RoundChange,
  type RoundState,
} from '@/features/job-applications/services/rounds.ts';
import { isUpcoming } from '@/features/job-applications/services/upcoming.ts';
import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

// What moving an application to a status does to its rounds, which are given by date
export function planStatusChange(
  status: JobApplicationStatus,
  rounds: RoundState[],
  now: Date
): { roundChanges: RoundChange[]; effect: StatusChangeEffect } {
  // The next round, the earliest one still waiting for an outcome, is the one a decision on the
  // application is about, so it gets the outcome that decision means
  const next = rounds.find(({ outcome }) => outcome === InterviewOutcome.Scheduled);
  const upcoming = rounds.filter((round) => isUpcoming(round, now));

  if (status === JobApplicationStatus.Offer) {
    // An offer passes the next round. The ones after it are left: they may still be part of it
    return planRounds(next && { round: next, outcome: InterviewOutcome.Passed }, []);
  }

  if (status === JobApplicationStatus.Rejected) {
    // A rejection fails the next round, and the ones still to come after it won't happen. When
    // a round already failed it is what the rejection was about, so none is failed on top of it:
    // the ones still to come are only cancelled
    const alreadyFailed = rounds.some(({ outcome }) => outcome === InterviewOutcome.Failed);
    const settled = alreadyFailed ? undefined : next;
    return planRounds(
      settled && { round: settled, outcome: InterviewOutcome.Failed },
      upcoming.filter((round) => round !== settled)
    );
  }

  if (STATUSES_THAT_CANCEL_UPCOMING_ROUNDS.includes(status)) {
    return planRounds(undefined, upcoming);
  }

  return { roundChanges: [], effect: NO_STATUS_CHANGE_EFFECT };
}

function planRounds(
  settled:
    { round: RoundState; outcome: InterviewOutcome.Passed | InterviewOutcome.Failed } | undefined,
  toCancel: RoundState[]
): { roundChanges: RoundChange[]; effect: StatusChangeEffect } {
  return {
    roundChanges: [
      ...(settled ? [{ roundId: settled.round.id, outcome: settled.outcome }] : []),
      ...toCancel.map(({ id }) => ({ roundId: id, outcome: InterviewOutcome.Cancelled as const })),
    ],
    effect: {
      settledRound: settled
        ? { roundType: settled.round.roundType, outcome: settled.outcome }
        : null,
      cancelledRounds: toCancel.length,
    },
  };
}

// Moves an application to a status and records the move, and why when it says, in its history,
// and settles its interview rounds as the status means. Null when there is no such application
export async function moveToStatus(
  jobApplicationId: string,
  status: JobApplicationStatus,
  note?: string
): Promise<StatusChangeEffect | null> {
  return dbClient.transaction(async ({ orm }) => {
    const tx = orm.public;

    const jobApplication = await tx.JobApplication.first({ id: uuid(jobApplicationId) });
    if (!jobApplication) return null;
    // Nothing moved, so nothing to record
    if (jobApplication.currentStatus === status) return NO_STATUS_CHANGE_EFFECT;

    const { roundChanges, effect } = planStatusChange(
      status,
      await readRoundsOf(tx, jobApplicationId),
      new Date()
    );

    await recordStatusChange(tx, [jobApplicationId], status, note);
    await applyRoundChanges(tx, roundChanges);
    return effect;
  });
}
