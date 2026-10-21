'use server';

import { z } from 'zod';
import { updateTag } from 'next/cache';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { Result } from '@/types/result.ts';
import { GhostedUndo } from '@/features/job-applications/schemas/ghosted-undo-schema.ts';
import { ghost } from '@/features/job-applications/services/ghosting.ts';

const idsSchema = z.array(z.uuid());

// Moves the chosen applications that are still in progress and silent for months to Ghosted. What
// it takes to put them back is in the result
export async function markGhostedJobApplications(ids: string[]): Promise<Result<GhostedUndo>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(ids, idsSchema);
  if (!parsed.success) {
    return parsed;
  }

  const undo = await ghost(userId, parsed.data);

  updateTag(cacheTags.jobApplications(userId));
  return { success: true, data: undo };
}
