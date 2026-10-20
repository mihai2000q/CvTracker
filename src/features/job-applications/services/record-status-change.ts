import 'server-only';
import { dbClient } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { MODEL_APPLICATION_STATUSES } from '@/features/job-applications/types/enums/model-application-status.ts';

type Transaction = Parameters<Parameters<typeof dbClient.transaction>[0]>[0]['orm']['public'];

// Moves applications to a status and appends the move, and why when it says, to each one's
// history, so the two never part. It says which history rows it wrote
export async function recordStatusChange(
  tx: Transaction,
  jobApplicationIds: string[],
  status: JobApplicationStatus,
  note?: string
): Promise<{ id: string }[]> {
  if (jobApplicationIds.length === 0) return [];

  await tx.JobApplication.where((application) =>
    application.id.in(jobApplicationIds.map(uuid))
  ).updateAll({ currentStatus: MODEL_APPLICATION_STATUSES[status] });

  const changedAt = new Date().toISOString();
  return tx.ApplicationStatusHistory.createAll(
    jobApplicationIds.map((id) => ({
      jobApplicationId: uuid(id),
      status: MODEL_APPLICATION_STATUSES[status],
      note: note || undefined,
      changedAt,
    }))
  );
}
