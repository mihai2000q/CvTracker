import 'server-only';
import { Temporal } from 'temporal-polyfill';
import { dbClient, type Database } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { InterviewOutcome as DbInterviewOutcome } from '@database/enums.ts';
import {
  GHOSTED_AFTER_MONTHS,
  GHOSTED_NOTE,
  IN_PROGRESS_STATUSES,
} from '@/features/job-applications/constants/job-application-statuses.ts';
import { type GhostedUndo } from '@/features/job-applications/schemas/ghosted-undo-schema.ts';
import { planStatusChange } from '@/features/job-applications/services/move-to-status.ts';
import { applyRoundChanges, readRounds } from '@/features/job-applications/services/rounds.ts';
import { recordStatusChange } from '@/features/job-applications/services/record-status-change.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { MODEL_APPLICATION_STATUSES } from '@/features/job-applications/types/enums/model-application-status.ts';
import type { StaleJobApplication } from '@/features/job-applications/types/job-application.ts';

// The applications of a user that are in progress and haven't been updated for GHOSTED_AFTER_MONTHS,
// the longest silent first. The last update is the latest of the day it was applied to and its
// status changes
export async function findStaleJobApplications(
  tx: Pick<Database, 'JobApplication'>,
  userId: string
): Promise<StaleJobApplication[]> {
  const cutoff = Temporal.Now.zonedDateTimeISO('UTC').subtract({ months: GHOSTED_AFTER_MONTHS });
  const cutoffInstant = cutoff.toInstant().toString();

  const inProgress = IN_PROGRESS_STATUSES.map(
    (status) => MODEL_APPLICATION_STATUSES[status as JobApplicationStatus]
  );
  const applications = await tx.JobApplication.where({ userId: uuid(userId) })
    .where((application) => application.currentStatus.in(inProgress))
    .where((application) => application.appliedAt.lt(cutoff.toPlainDate()))
    .where((application) =>
      application.statusHistory.none((change) => change.changedAt.gte(cutoffInstant))
    )
    .select('id', 'title', 'currentStatus', 'appliedAt', 'organizationId', 'countryId')
    .include('organization', (organization) => organization.select('id', 'name'))
    .include('country', (country) => country.select('id', 'name', 'isoCode'))
    .include('statusHistory', (changes) => changes.max('changedAt'))
    .all();

  return applications
    .map((application) => ({
      application,
      lastUpdate: Math.max(
        Date.parse(application.appliedAt.toString()),
        application.statusHistory ? Date.parse(application.statusHistory) : 0
      ),
    }))
    .sort((a, b) => a.lastUpdate - b.lastUpdate)
    .map(({ application, lastUpdate }) => ({
      id: application.id,
      title: application.title,
      organization: application.organization!,
      country: application.country!,
      currentStatus: application.currentStatus as JobApplicationStatus,
      lastUpdate: new Date(lastUpdate).toISOString().slice(0, 10),
    }));
}

// Moves the chosen stale applications to Ghosted, records the move in each one's history and
// cancels the interview rounds still to come. The stale list is worked out again here, not taken
// from the page, so one that is no longer stale is left alone. It says what it takes to put them
// back
export async function ghost(userId: string, chosenIds: string[]): Promise<GhostedUndo> {
  return dbClient.transaction(async ({ orm }) => {
    const tx = orm.public;
    const chosen = new Set(chosenIds);
    const jobApplications = (await findStaleJobApplications(tx, userId)).filter(({ id }) =>
      chosen.has(id)
    );
    if (jobApplications.length === 0) return { applications: [], historyIds: [] };

    const ids = jobApplications.map(({ id }) => id);
    // Ghosted cancels the rounds still to come, as it does when it is set by hand
    const roundsByApplication = await readRounds(tx, ids);
    const now = new Date();
    const cancelledByApplication = new Map(
      ids.map((id) => [
        id,
        planStatusChange(JobApplicationStatus.NoResponse, roundsByApplication.get(id) ?? [], now)
          .roundChanges,
      ])
    );
    await applyRoundChanges(tx, [...cancelledByApplication.values()].flat());

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
        cancelledRoundIds: (cancelledByApplication.get(id) ?? []).map(({ roundId }) => roundId),
      })),
      historyIds: history.map(({ id }) => id),
    };
  });
}

// Puts back the applications that were just ghosted, and drops what that wrote in their
// history. One that was moved on since, from Ghosted to anything else, is left alone
export async function undoGhost(userId: string, undo: GhostedUndo): Promise<void> {
  await dbClient.transaction(async ({ orm }) => {
    const tx = orm.public;

    for (const { id, previousStatus, cancelledRoundIds } of undo.applications) {
      const restored = await tx.JobApplication.where({
        id: uuid(id),
        userId: uuid(userId),
        currentStatus: MODEL_APPLICATION_STATUSES[JobApplicationStatus.NoResponse],
      }).updateAll({ currentStatus: MODEL_APPLICATION_STATUSES[previousStatus] });
      if (restored.length === 0) continue;

      await tx.ApplicationStatusHistory.where({ jobApplicationId: uuid(id) })
        .where((change) => change.id.in(undo.historyIds.map(uuid)))
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
}
