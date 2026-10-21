import { z } from 'zod';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

export const ghostedUndoSchema = z.object({
  applications: z.array(
    z.object({
      id: z.uuid(),
      previousStatus: z.enum(JobApplicationStatus),
      cancelledRoundIds: z.array(z.uuid()),
    })
  ),
  historyIds: z.array(z.uuid()),
});

// What it takes to put the applications back where they were
export type GhostedUndo = z.input<typeof ghostedUndoSchema>;
