'use server';

import { updateTag } from 'next/cache';
import { dbClient } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { InterviewOutcome as DbInterviewOutcome } from '@database/enums.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { Result } from '@/types/result.ts';
import {
  GhostedUndo,
  undoGhostedJobApplicationsSchema,
} from '@/features/job-applications/schemas/undo-ghosted-job-applications-schema.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { MODEL_APPLICATION_STATUSES } from '@/features/job-applications/types/enums/model-application-status.ts';

// Puts back the applications that were just marked as ghosted, and drops what that wrote in
// their history. One that was moved on since, from Ghosted to anything else, is left alone
export async function undoGhostedJobApplications(undo: GhostedUndo): Promise<Result<undefined>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(undo, undoGhostedJobApplicationsSchema);
  if (!parsed.success) {
    return parsed;
  }

  await dbClient.transaction(async ({ orm }) => {
    const tx = orm.public;

    for (const { id, previousStatus, cancelledRoundIds } of parsed.data.applications) {
      const restored = await tx.JobApplication.where({
        id: uuid(id),
        userId: uuid(userId),
        currentStatus: MODEL_APPLICATION_STATUSES[JobApplicationStatus.NoResponse],
      }).updateAll({ currentStatus: MODEL_APPLICATION_STATUSES[previousStatus] });
      if (restored.length === 0) continue;

      await tx.ApplicationStatusHistory.where({ jobApplicationId: uuid(id) })
        .where((change) => change.id.in(parsed.data.historyIds.map(uuid)))
        .deleteAll();
      if (cancelledRoundIds.length > 0) {
        await tx.InterviewRound.where({
          jobApplicationId: uuid(id),
          outcome: DbInterviewOutcome.members.Cancelled,
        })
          .where((round) => round.id.in(cancelledRoundIds.map(uuid)))
          .updateAll({ outcome: DbInterviewOutcome.members.Scheduled });
      }
    }
  });

  updateTag(cacheTags.jobApplications(userId));
  return { success: true, data: undefined };
}
