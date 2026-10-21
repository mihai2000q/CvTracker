import { z } from 'zod';
import { zEmptyToUndefined, zToArray } from '@/lib/zod/fields.ts';
import { scheduledAtFields } from '@/features/job-applications/schemas/scheduled-at-fields.ts';
import { RoundType } from '@/features/job-applications/types/enums/round-type.ts';

export const interviewRoundSchema = z.object({
  roundType: z.enum(RoundType, 'Round type is required'),
  ...scheduledAtFields,
  contactIds: zToArray(z.array(z.uuid('Contact is invalid'))),
  notes: zEmptyToUndefined(z.string().trim().optional()),
});
