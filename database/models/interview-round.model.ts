import type { ContractHelpers } from '../types.ts';
import { InterviewOutcome } from '../enums.ts';
import type { SqlTypes } from '../sql-types.ts';

export function interviewRoundModel({ model, field }: ContractHelpers, sqlTypes: SqlTypes) {
  return model('InterviewRound', {
    fields: {
      id: field.id.uuidv7String(),
      jobApplicationId: field.uuidString(),
      roundType: field.namedType(sqlTypes.varChar100),
      scheduledAt: field.temporal.timestamptzString(),
      outcome: field.namedType(InterviewOutcome).default(InterviewOutcome.members.Scheduled),
      notes: field.text().optional(),
    },
  }).sql(({ cols, constraints }) => ({
    indexes: [
      constraints.index([cols.jobApplicationId, cols.scheduledAt], {
        name: 'idx_job_application_id_scheduled_at',
      }),
    ],
  }));
}
