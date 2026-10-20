import { z } from 'zod';
import { Temporal } from 'temporal-polyfill';
import { zEmptyToUndefined, zToArray } from '@/lib/zod/fields.ts';
import { todayIn } from '@/lib/time-zone.ts';
import {
  scheduledAtFields,
  toScheduledAt,
} from '@/features/job-applications/schemas/scheduled-at-fields.ts';
import { RoundType } from '@/features/job-applications/types/enums/round-type.ts';

const newContactFields = z.object({
  name: z.string('Name is required').trim().min(1, 'Name is required').max(150, 'Name is too long'),
  email: zEmptyToUndefined(z.email('Email is invalid').max(255, 'Email is too long').optional()),
  phone: zEmptyToUndefined(z.string().trim().max(50, 'Phone is too long').optional()),
  role: zEmptyToUndefined(z.string().trim().max(100, 'Role is too long').optional()),
});

// A section left open but empty is no contact at all, so it becomes undefined before the
// fields are checked. Anything typed in it makes the name required
const newContactSchema = z.preprocess(
  (value) =>
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((field) => field === '' || field === undefined)
      ? undefined
      : value,
  newContactFields
);

const scheduleInterviewFields = z.object({
  jobApplicationId: z.uuid('Job application is invalid'),
  roundType: z.enum(RoundType, 'Round type is required'),
  ...scheduledAtFields,
  contactIds: zToArray(z.array(z.uuid('Contact is invalid'))),
  newContact: newContactSchema.optional(),
  notes: zEmptyToUndefined(z.string().trim().optional()),
});

// Only an interview still to come is scheduled, so the moment must not have passed. It is
// checked once the fields are valid, as it takes all three of the moment's
export const scheduleInterviewSchema = scheduleInterviewFields.transform(
  ({ date, time, timeZone, ...round }, ctx) => {
    const scheduledAt = toScheduledAt({ date, time, timeZone });
    if (Temporal.Instant.compare(scheduledAt, Temporal.Now.instant()) < 0) {
      const dayHasPassed = date < todayIn(timeZone);
      ctx.issues.push({
        code: 'custom',
        input: round,
        path: [dayHasPassed ? 'date' : 'time'],
        message: dayHasPassed ? 'Date cannot be in the past' : 'Time cannot be in the past',
      });
    }
    return { ...round, scheduledAt };
  }
);

// What the form holds, which is not what it submits: the moment comes from three of its fields
export type ScheduleInterviewForm = z.infer<typeof scheduleInterviewFields>;
export type NewContactForm = z.infer<typeof newContactFields>;
