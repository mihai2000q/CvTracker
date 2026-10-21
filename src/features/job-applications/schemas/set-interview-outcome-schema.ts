import { z } from 'zod';
import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';

export const setInterviewOutcomeSchema = z.object({
  interviewRoundId: z.uuid('Interview round is invalid'),
  outcome: z.enum(InterviewOutcome, 'Outcome is invalid'),
});

export type SetInterviewOutcomeInput = z.input<typeof setInterviewOutcomeSchema>;
