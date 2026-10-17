import { z } from 'zod';
import { zEmptyToUndefined, zToArray } from '@/lib/zod/fields.ts';
import { RoundType } from '@/features/job-applications/types/enums/round-type.ts';

const isTimeZone = (value: string) => {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

export const updateInterviewRoundSchema = z.object({
  id: z.uuid('Interview round is invalid'),
  roundType: z.enum(RoundType, 'Round type is required'),
  // A round that has happened is edited too, so its date can be in the past
  date: z.string('Date is required').min(1, 'Date is required').pipe(z.iso.date('Date is invalid')),
  time: z
    .string('Time is required')
    .min(1, 'Time is required')
    .pipe(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time is invalid')),
  // The date and time are the user's wall clock: this says where
  timeZone: z.string().refine(isTimeZone, 'Time zone is invalid'),
  contactIds: zToArray(z.array(z.uuid('Contact is invalid'))),
  notes: zEmptyToUndefined(z.string().trim().optional()),
});

export type UpdateInterviewRoundForm = z.infer<typeof updateInterviewRoundSchema>;
