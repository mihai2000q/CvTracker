'use server';

import { updateTag } from 'next/cache';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { Result } from '@/types/result.ts';
import {
  GhostedUndo,
  ghostedUndoSchema,
} from '@/features/job-applications/lifecycle/ghosted-undo.ts';
import { undoGhost } from '@/features/job-applications/lifecycle/ghosting.ts';

// Puts back the applications that were just marked as ghosted. One that was moved on since is
// left alone
export async function undoGhostedJobApplications(undo: GhostedUndo): Promise<Result<undefined>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(undo, ghostedUndoSchema);
  if (!parsed.success) {
    return parsed;
  }

  await undoGhost(userId, parsed.data);

  updateTag(cacheTags.jobApplications(userId));
  return { success: true, data: undefined };
}
