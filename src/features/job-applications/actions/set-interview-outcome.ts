'use server';

import { updateTag } from 'next/cache';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { Result } from '@/types/result.ts';
import { recordRoundOutcome } from '@/features/job-applications/services/record-round-outcome.ts';
import {
  setInterviewOutcomeSchema,
  SetInterviewOutcomeInput,
} from '@/features/job-applications/schemas/set-interview-outcome-schema.ts';
import { InterviewOutcomeEffect } from '@/features/job-applications/types/interview-outcome-effect.ts';

// A failed round rejects the application still in progress, unless another round is yet to
// take place: then it only says so, for the user to decide
export async function setInterviewOutcome(
  input: SetInterviewOutcomeInput
): Promise<Result<InterviewOutcomeEffect>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(input, setInterviewOutcomeSchema);
  if (!parsed.success) {
    return parsed;
  }
  const { interviewRoundId, outcome } = parsed.data;

  const effect = await recordRoundOutcome(interviewRoundId, outcome);
  if (!effect) {
    return { success: false, errors: { interviewRoundId: ['Interview round not found'] } };
  }

  updateTag(cacheTags.jobApplications(userId));
  return { success: true, data: effect };
}
