import 'server-only';
import { Temporal } from 'temporal-polyfill';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import {
  GHOSTED_AFTER_MONTHS,
  IN_PROGRESS_STATUSES,
} from '@/features/job-applications/constants/job-application-statuses.ts';
import { MODEL_APPLICATION_STATUSES } from '@/features/job-applications/types/enums/model-application-status.ts';
import type { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import type { StaleJobApplication } from '@/features/job-applications/types/job-application.ts';

// The applications of a user that are in progress and haven't been updated for GHOSTED_AFTER_MONTHS,
// the longest silent first. The last update is the latest of the day it was applied to and its
// status changes
export async function findStaleJobApplications(
  tx: { JobApplication: typeof db.JobApplication },
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
