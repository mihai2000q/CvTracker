import 'server-only';
import { uuid } from '@database/field-values.ts';
import { InterviewOutcome as DbInterviewOutcome } from '@database/enums.ts';
import type { Transaction } from '@database/db.ts';
import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';
import { RoundType } from '@/features/job-applications/types/enums/round-type.ts';

// The interview rounds of an application, read as the rules see them and written as they say
export interface RoundState {
  id: string;
  roundType: RoundType;
  outcome: InterviewOutcome;
  scheduledAt: string;
}

export interface RoundChange {
  roundId: string;
  outcome: InterviewOutcome;
}

const DB_OUTCOMES = {
  [InterviewOutcome.Scheduled]: DbInterviewOutcome.members.Scheduled,
  [InterviewOutcome.Passed]: DbInterviewOutcome.members.Passed,
  [InterviewOutcome.Failed]: DbInterviewOutcome.members.Failed,
  [InterviewOutcome.Cancelled]: DbInterviewOutcome.members.Cancelled,
};

// The rounds of each application by date, none for one that has none
export async function readRounds(
  tx: Transaction,
  jobApplicationIds: string[]
): Promise<Map<string, RoundState[]>> {
  const rounds = await tx.InterviewRound.where((round) =>
    round.jobApplicationId.in(jobApplicationIds.map(uuid))
  )
    .orderBy((round) => round.scheduledAt.asc())
    .all();

  const byApplication = new Map<string, RoundState[]>(jobApplicationIds.map((id) => [id, []]));
  for (const { id, jobApplicationId, roundType, outcome, scheduledAt } of rounds) {
    byApplication.get(jobApplicationId)?.push({
      id,
      roundType: roundType as RoundState['roundType'],
      outcome: outcome as InterviewOutcome,
      scheduledAt,
    });
  }
  return byApplication;
}

export async function readRoundsOf(tx: Transaction, jobApplicationId: string) {
  return (await readRounds(tx, [jobApplicationId])).get(jobApplicationId) ?? [];
}

// Gives each round its outcome
export async function applyRoundChanges(tx: Transaction, changes: RoundChange[]) {
  for (const outcome of new Set(changes.map((change) => change.outcome))) {
    const ids = changes.filter((change) => change.outcome === outcome).map((c) => c.roundId);
    await tx.InterviewRound.where((round) => round.id.in(ids.map(uuid))).updateAll({
      outcome: DB_OUTCOMES[outcome],
    });
  }
}
