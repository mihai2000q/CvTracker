import { z } from 'zod';
import {
  CV_ISSUE,
  hasExactlyOneCv,
  jobApplicationSchema,
} from '@/features/job-applications/schemas/job-application-schema.ts';

export const updateJobApplicationSchema = (getToday: () => string) =>
  jobApplicationSchema(getToday)
    .extend({
      id: z.uuid('Job application must be identifiable'),
    })
    .refine(hasExactlyOneCv, CV_ISSUE);

export type UpdateJobApplicationForm = z.infer<ReturnType<typeof updateJobApplicationSchema>>;
