'use server';

import { updateTag } from 'next/cache';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { Result } from '@/types/result.ts';
import { type StatusChangeEffect } from '@/features/job-applications/constants/job-application-statuses.ts';
import { moveToStatus } from '@/features/job-applications/lifecycle/move-to-status.ts';
import {
  changeJobApplicationStatusSchema,
  ChangeJobApplicationStatusInput,
} from '@/features/job-applications/schemas/change-job-application-status-schema.ts';

// Moves an application to a status and records the move, and why when it says, in its history.
// A status that ends the application cancels the interview rounds still to come, and the
// result says how many
export async function changeJobApplicationStatus(
  input: ChangeJobApplicationStatusInput
): Promise<Result<StatusChangeEffect>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(input, changeJobApplicationStatusSchema);
  if (!parsed.success) {
    return parsed;
  }
  const { jobApplicationId, status, note } = parsed.data;

  const effect = await moveToStatus(jobApplicationId, status, note);
  if (!effect) {
    return { success: false, errors: { jobApplicationId: ['Job application not found'] } };
  }

  updateTag(cacheTags.jobApplications(userId));
  return { success: true, data: effect };
}
