import { z } from 'zod';
import { zToArray } from '@/lib/zod/fields.ts';
import {
  CV_ISSUE,
  hasExactlyOneCv,
  jobApplicationSchema,
} from '@/features/job-applications/schemas/job-application-schema.ts';

export const createJobApplicationSchema = (getToday: () => string) =>
  jobApplicationSchema(getToday)
    .extend({
      skillIds: zToArray(z.array(z.uuid('Skill must be identifiable'))),
    })
    .refine(hasExactlyOneCv, CV_ISSUE);

export type CreateJobApplicationForm = z.infer<ReturnType<typeof createJobApplicationSchema>>;
