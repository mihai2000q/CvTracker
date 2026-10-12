import type { ContractHelpers } from '../types.ts';
import { InterviewOutcome, RoundType } from '../enums.ts';
import type { SqlTypes } from '../sql-types.ts';

export function interviewRoundModels({ model, field }: ContractHelpers, sqlTypes: SqlTypes) {
  const InterviewRound = model('InterviewRound', {
    fields: {
      id: field.id.uuidv7String(),
      roundType: field.namedType(RoundType),
      scheduledAt: field.temporal.timestamptzString(),
      outcome: field.namedType(InterviewOutcome).default(InterviewOutcome.members.Scheduled),
      notes: field.text().optional(),
      jobApplicationId: field.uuidString(),
    },
  }).sql(({ cols, constraints }) => ({
    indexes: [
      constraints.index([cols.jobApplicationId, cols.scheduledAt], {
        name: 'idx_job_application_id_scheduled_at',
      }),
    ],
  }));

  const InterviewRoundHasContact = model('InterviewRoundHasContact', {
    fields: {
      interviewRoundId: field.uuidString(),
      contactId: field.uuidString(),
    },
  }).attributes(({ fields, constraints }) => ({
    id: constraints.id([fields.interviewRoundId, fields.contactId]),
  }));

  return { InterviewRound, InterviewRoundHasContact };
}
