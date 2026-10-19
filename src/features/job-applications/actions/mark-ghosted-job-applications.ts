'use server';

import { z } from 'zod';
import { updateTag } from 'next/cache';
import { dbClient } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { InterviewOutcome as DbInterviewOutcome } from '@database/enums.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { Result } from '@/types/result.ts';
import { GHOSTED_NOTE } from '@/features/job-applications/constants/job-application-statuses.ts';
import { cancelUpcomingRoundsOfApplications } from '@/features/job-applications/services/cancel-upcoming-rounds.ts';
import { findStaleJobApplications } from '@/features/job-applications/services/find-stale-job-applications.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { MODEL_APPLICATION_STATUSES } from '@/features/job-applications/types/enums/model-application-status.ts';

// What it takes to put the applications back where they were
export interface GhostedUndo {
  applications: {
    id: string;
    previousStatus: JobApplicationStatus;
    cancelledRoundIds: string[];
  }[];
  historyIds: string[];
}

const undoSchema = z.object({
  applications: z.array(
    z.object({
      id: z.uuid(),
      previousStatus: z.enum(JobApplicationStatus),
      cancelledRoundIds: z.array(z.uuid()),
    })
  ),
  historyIds: z.array(z.uuid()),
});

// Moves every application in progress that has been silent for months to Ghosted, records the
// move in each one's history, and cancels the interview rounds still to come. The list is worked out again here, not taken from the page, so
// it is the one the user is looking at only if nothing changed since
export async function markGhostedJobApplications(): Promise<Result<GhostedUndo>> {
  const userId = getUserId(await verifySession());

  const undo = await dbClient.transaction(async ({ orm }) => {
    const tx = orm.public;
    const jobApplications = await findStaleJobApplications(tx, userId);
    const undo: GhostedUndo = { applications: [], historyIds: [] };
    const cancelledRounds = await cancelUpcomingRoundsOfApplications(
      tx,
      jobApplications.map(({ id }) => id)
    );

    for (const { id, currentStatus } of jobApplications) {
      await tx.JobApplication.where({ id: uuid(id) }).update({
        currentStatus: MODEL_APPLICATION_STATUSES[JobApplicationStatus.NoResponse],
      });
      const history = await tx.ApplicationStatusHistory.create({
        jobApplicationId: uuid(id),
        status: MODEL_APPLICATION_STATUSES[JobApplicationStatus.NoResponse],
        note: GHOSTED_NOTE,
        changedAt: new Date().toISOString(),
      });
      undo.applications.push({
        id,
        previousStatus: currentStatus,
        cancelledRoundIds: cancelledRounds
          .filter((round) => round.jobApplicationId === id)
          .map((round) => round.id),
      });
      undo.historyIds.push(history.id);
    }
    return undo;
  });

  updateTag(cacheTags.jobApplications(userId));
  return { success: true, data: undo };
}

// Puts back the applications that were just marked as ghosted, and drops what that wrote in
// their history. One that was moved on since, from Ghosted to anything else, is left alone
export async function undoGhostedJobApplications(undo: GhostedUndo): Promise<Result<undefined>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(undo, undoSchema);
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
