'use server';

import { updateTag } from 'next/cache';
import { dbClient } from '@database/db.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { Result } from '@/types/result.ts';
import { GHOSTED_NOTE } from '@/features/job-applications/constants/job-application-statuses.ts';
import { cancelUpcomingRoundsOfApplications } from '@/features/job-applications/services/cancel-upcoming-rounds.ts';
import { recordStatusChange } from '@/features/job-applications/services/record-status-change.ts';
import { GhostedUndo } from '@/features/job-applications/schemas/undo-ghosted-job-applications-schema.ts';
import { findStaleJobApplications } from '@/features/job-applications/services/find-stale-job-applications.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

// Moves every application in progress that has been silent for months to Ghosted, records the
// move in each one's history, and cancels the interview rounds still to come. The list is worked out again here, not taken from the page, so
// it is the one the user is looking at only if nothing changed since
export async function markGhostedJobApplications(): Promise<Result<GhostedUndo>> {
  const userId = getUserId(await verifySession());

  const undo = await dbClient.transaction(async ({ orm }) => {
    const tx = orm.public;
    const jobApplications = await findStaleJobApplications(tx, userId);
    if (jobApplications.length === 0) return { applications: [], historyIds: [] };

    const ids = jobApplications.map(({ id }) => id);
    const cancelledRounds = await cancelUpcomingRoundsOfApplications(tx, ids);

    const history = await recordStatusChange(
      tx,
      ids,
      JobApplicationStatus.NoResponse,
      GHOSTED_NOTE
    );

    return {
      applications: jobApplications.map(({ id, currentStatus }) => ({
        id,
        previousStatus: currentStatus,
        cancelledRoundIds: cancelledRounds
          .filter((round) => round.jobApplicationId === id)
          .map((round) => round.id),
      })),
      historyIds: history.map(({ id }) => id),
    };
  });

  updateTag(cacheTags.jobApplications(userId));
  return { success: true, data: undo };
}
