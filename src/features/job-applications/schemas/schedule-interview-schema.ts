import { z } from 'zod';
import { Temporal } from 'temporal-polyfill';
import { todayIn } from '@/lib/time-zone.ts';
import { contactSchema } from '@/features/organizations/schemas/contact-schema.ts';
import { interviewRoundSchema } from '@/features/job-applications/schemas/interview-round-schema.ts';
import { toScheduledAt } from '@/features/job-applications/schemas/scheduled-at-fields.ts';

// A section left open but empty is no contact at all, so it becomes undefined before the
// fields are checked. Anything typed in it makes the name required
const newContactSchema = z.preprocess(
  (value) =>
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((field) => field === '' || field === undefined)
      ? undefined
      : value,
  contactSchema
);

const scheduleInterviewFields = interviewRoundSchema.extend({
  jobApplicationId: z.uuid('Job application is invalid'),
  newContact: newContactSchema.optional(),
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
