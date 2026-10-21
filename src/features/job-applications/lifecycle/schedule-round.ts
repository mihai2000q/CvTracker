import 'server-only';
import { STATUSES_BEFORE_INTERVIEW } from '@/features/job-applications/constants/job-application-statuses.ts';
import { recordStatusChange } from '@/features/job-applications/lifecycle/record-status-change.ts';
import type { Transaction } from '@database/db.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

// A round was just scheduled in this transaction: an application that had not reached the
// interviews moves to Interview. Anywhere else the status is a decision of its own and stays
export async function moveToInterviewOnScheduling(
  tx: Transaction,
  jobApplicationId: string,
  currentStatus: string
): Promise<void> {
  if (!STATUSES_BEFORE_INTERVIEW.includes(currentStatus)) return;
  await recordStatusChange(tx, [jobApplicationId], JobApplicationStatus.Interview);
}
