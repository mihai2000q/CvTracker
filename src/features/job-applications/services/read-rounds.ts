import 'server-only';
import { uuid } from '@database/field-values.ts';
import { InterviewOutcome as DbInterviewOutcome } from '@database/enums.ts';
import type { Transaction } from '@database/db.ts';
import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';
import { RoundType } from '@/features/job-applications/types/enums/round-type.ts';

export interface RoundState {
  id: string;
  roundType: RoundType;
  outcome: InterviewOutcome;
  scheduledAt: string;
}

export const DB_OUTCOMES = {
  [InterviewOutcome.Scheduled]: DbInterviewOutcome.members.Scheduled,
  [InterviewOutcome.Passed]: DbInterviewOutcome.members.Passed,
  [InterviewOutcome.Failed]: DbInterviewOutcome.members.Failed,
  [InterviewOutcome.Cancelled]: DbInterviewOutcome.members.Cancelled,
};

// The rounds of an application by date, as the rules see them
export async function readRounds(tx: Transaction, jobApplicationId: string): Promise<RoundState[]> {
  const rounds = await tx.InterviewRound.where({ jobApplicationId: uuid(jobApplicationId) })
    .orderBy((round) => round.scheduledAt.asc())
    .all();
  return rounds.map(({ id, roundType, outcome, scheduledAt }) => ({
    id,
    roundType: roundType as RoundState['roundType'],
    outcome: outcome as InterviewOutcome,
    scheduledAt,
  }));
}
