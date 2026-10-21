import 'server-only';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import type { ApplicationRow, FunnelStage } from '@/features/dashboard/types/dashboard-stats.ts';

// The stages an application goes through, in order. How far one got is the furthest of them it
// ever had, so an application that was rejected after an interview still counts as having
// reached the interview
const PIPELINE: readonly JobApplicationStatus[] = [
  JobApplicationStatus.Applied,
  JobApplicationStatus.Screening,
  JobApplicationStatus.Interview,
  JobApplicationStatus.Offer,
];

export const SCREENING_STAGE = PIPELINE.indexOf(JobApplicationStatus.Screening);
export const INTERVIEW_STAGE = PIPELINE.indexOf(JobApplicationStatus.Interview);
export const OFFER_STAGE = PIPELINE.indexOf(JobApplicationStatus.Offer);

// The position in the pipeline of the furthest stage the application ever had
export const furthestStage = ({ currentStatus, historyStatuses }: ApplicationRow) =>
  Math.max(
    0,
    ...[currentStatus, ...historyStatuses].map((status) =>
      PIPELINE.indexOf(status as JobApplicationStatus)
    )
  );

// How many applications got to each stage of the pipeline, given the furthest stage of each
export const computeFunnel = (stages: number[]): FunnelStage[] =>
  PIPELINE.map((status, index) => ({
    status,
    count: stages.filter((stage) => stage >= index).length,
  }));
