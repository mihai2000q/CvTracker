import { z } from 'zod';
import { format } from 'date-fns';
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

export const scheduleInterviewSchema = z.object({
  jobApplicationId: z.uuid('Job application is invalid'),
  roundType: z.enum(RoundType, 'Round type is required'),
  date: z
    .string('Date is required')
    .min(1, 'Date is required')
    .pipe(z.iso.date('Date is invalid'))
    .pipe(
      z.string().refine((date) => date >= format(new Date(), 'yyyy-MM-dd'), {
        message: 'Date cannot be in the past',
      })
    ),
  time: z
    .string('Time is required')
    .min(1, 'Time is required')
    .pipe(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time is invalid')),
  // The date and time are the user's wall clock: this says where
  timeZone: z.string().refine(isTimeZone, 'Time zone is invalid'),
  contactIds: zToArray(z.array(z.uuid('Contact is invalid'))),
  newContact: newContactSchema.optional(),
  notes: zEmptyToUndefined(z.string().trim().optional()),
});

export type ScheduleInterviewForm = z.infer<typeof scheduleInterviewSchema>;
export type NewContactForm = z.infer<typeof newContactFields>;
