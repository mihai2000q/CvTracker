import { z } from 'zod';
import { interviewRoundSchema } from '@/features/job-applications/schemas/interview-round-schema.ts';
import { toScheduledAt } from '@/features/job-applications/schemas/scheduled-at-fields.ts';

// A round that has happened is edited too, so its moment can be in the past
const updateInterviewRoundFields = interviewRoundSchema.extend({
  id: z.uuid('Interview round is invalid'),
});

export const updateInterviewRoundSchema = updateInterviewRoundFields.transform(
  ({ date, time, timeZone, ...round }) => ({
    ...round,
    scheduledAt: toScheduledAt({ date, time, timeZone }),
  })
);

// What the form holds, which is not what it submits: the moment comes from three of its fields
export type UpdateInterviewRoundForm = z.infer<typeof updateInterviewRoundFields>;
