import 'server-only';
import { dbClient } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { IN_PROGRESS_STATUSES } from '@/features/job-applications/constants/job-application-statuses.ts';
import { ROUND_TYPE_LABELS } from '@/features/job-applications/constants/round-types.ts';
import { recordStatusChange } from '@/features/job-applications/services/record-status-change.ts';
import {
  applyRoundChanges,
  readRoundsOf,
  type RoundState,
} from '@/features/job-applications/services/rounds.ts';
import { isUpcoming } from '@/features/job-applications/services/upcoming.ts';
import { InterviewOutcomeEffect } from '@/features/job-applications/types/interview-outcome-effect.ts';
import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

// What a round that was just given an outcome does to its application. A failed round rejects
// an application still in progress, unless another round is yet to take place: then it only
// says so, for the user to decide. `rounds` are all of the application's, with the new outcome
export function planRoundOutcome(
  round: Pick<RoundState, 'id' | 'roundType'>,
  outcome: InterviewOutcome,
  applicationStatus: string,
  rounds: RoundState[],
  now: Date
): { rejectionNote: string | null; effect: InterviewOutcomeEffect } {
  const endsInProgress =
    outcome === InterviewOutcome.Failed && IN_PROGRESS_STATUSES.includes(applicationStatus);
  if (!endsInProgress) {
    return { rejectionNote: null, effect: { rejected: false, suggestRejection: false } };
  }

  if (rounds.some((other) => isUpcoming(other, now))) {
    return { rejectionNote: null, effect: { rejected: false, suggestRejection: true } };
  }

  return {
    rejectionNote: `${ROUND_TYPE_LABELS[round.roundType]} round failed`,
    effect: { rejected: true, suggestRejection: false },
  };
}

// Gives an interview round its outcome. A failed one rejects the application still in progress,
// unless another round is yet to take place: then it only says so, for the user to decide.
// Null when there is no such round
export async function recordRoundOutcome(
  interviewRoundId: string,
  outcome: InterviewOutcome
): Promise<InterviewOutcomeEffect | null> {
  return dbClient.transaction(async ({ orm }) => {
    const tx = orm.public;

    const round = await tx.InterviewRound.first({ id: uuid(interviewRoundId) });
    if (!round) return null;

    await applyRoundChanges(tx, [{ roundId: round.id, outcome }]);

    const jobApplication = await tx.JobApplication.first({ id: round.jobApplicationId });
    const { rejectionNote, effect } = planRoundOutcome(
      { id: round.id, roundType: round.roundType as RoundState['roundType'] },
      outcome,
      jobApplication?.currentStatus ?? '',
      await readRoundsOf(tx, round.jobApplicationId),
      new Date()
    );

    if (rejectionNote) {
      await recordStatusChange(
        tx,
        [round.jobApplicationId],
        JobApplicationStatus.Rejected,
        rejectionNote
      );
    }
    return effect;
  });
}
