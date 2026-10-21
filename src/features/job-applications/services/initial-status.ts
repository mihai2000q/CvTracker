import type { Database } from '@database/db.ts';
import { ApplicationStatus } from '@database/enums.ts';

type JobApplicationInput = Parameters<Database['JobApplication']['create']>[0];
type StatusHistoryRelation = Extract<
  NonNullable<JobApplicationInput['statusHistory']>,
  (...args: never[]) => unknown
>;

// The first entry of the status history of an application that is being created, which starts as
// Applied. It goes in the same write as the application, so the two never part
export const initialStatusHistory: StatusHistoryRelation = (statusHistory) =>
  statusHistory.create({
    status: ApplicationStatus.members.Applied,
    changedAt: new Date().toISOString(),
  });
