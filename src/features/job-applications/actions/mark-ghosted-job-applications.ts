'use server';

import { updateTag } from 'next/cache';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { Result } from '@/types/result.ts';
import { GhostedUndo } from '@/features/job-applications/schemas/ghosted-undo-schema.ts';
import { ghost } from '@/features/job-applications/services/ghosting.ts';

// Moves every application in progress that has been silent for months to Ghosted. What it takes
// to put them back is in the result
export async function markGhostedJobApplications(): Promise<Result<GhostedUndo>> {
  const userId = getUserId(await verifySession());

  const undo = await ghost(userId);

  updateTag(cacheTags.jobApplications(userId));
  return { success: true, data: undo };
}
