import { z } from 'zod';
import { Temporal } from 'temporal-polyfill';
import { isTimeZone } from '@/lib/time-zone.ts';

// When an interview round takes place, as the form has it: the date and the time are the
// user's wall clock, and the time zone says where. `toScheduledAt` puts the three together
export const scheduledAtFields = {
  date: z.string('Date is required').min(1, 'Date is required').pipe(z.iso.date('Date is invalid')),
  time: z
    .string('Time is required')
    .min(1, 'Time is required')
    .pipe(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time is invalid')),
  timeZone: z.string().refine(isTimeZone, 'Time zone is invalid'),
};

export type ScheduledAtFields = z.infer<z.ZodObject<typeof scheduledAtFields>>;

// The moment they name, as an ISO instant
export const toScheduledAt = ({ date, time, timeZone }: ScheduledAtFields) =>
  Temporal.PlainDateTime.from(`${date}T${time}`).toZonedDateTime(timeZone).toInstant().toString();
