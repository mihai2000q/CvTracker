import { z } from 'zod';
import { zEmptyToUndefined, zToArray } from '@/lib/zod/fields.ts';
import {
  scheduledAtFields,
  toScheduledAt,
} from '@/features/job-applications/schemas/scheduled-at-fields.ts';
import { RoundType } from '@/features/job-applications/types/enums/round-type.ts';

const updateInterviewRoundFields = z.object({
  id: z.uuid('Interview round is invalid'),
  roundType: z.enum(RoundType, 'Round type is required'),
  // A round that has happened is edited too, so its moment can be in the past
  ...scheduledAtFields,
  contactIds: zToArray(z.array(z.uuid('Contact is invalid'))),
  notes: zEmptyToUndefined(z.string().trim().optional()),
});

export const updateInterviewRoundSchema = updateInterviewRoundFields.transform(
  ({ date, time, timeZone, ...round }) => ({
    ...round,
    scheduledAt: toScheduledAt({ date, time, timeZone }),
  })
);

// What the form holds, which is not what it submits: the moment comes from three of its fields
export type UpdateInterviewRoundForm = z.infer<typeof updateInterviewRoundFields>;
