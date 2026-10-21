import { z } from 'zod';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

export const changeJobApplicationStatusSchema = z.object({
  jobApplicationId: z.uuid('Job application is invalid'),
  status: z.enum(JobApplicationStatus, 'Status is invalid'),
  note: z.string().trim().max(500).optional(),
});

export type ChangeJobApplicationStatusInput = z.input<typeof changeJobApplicationStatusSchema>;
