import 'server-only';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { IN_PROGRESS_STATUSES } from '@/features/job-applications/constants/job-application-statuses.ts';
import {
  INTERVIEW_STAGE,
  OFFER_STAGE,
  SCREENING_STAGE,
} from '@/features/dashboard/queries/get-dashboard-stats/compute-funnel.ts';
import type { ApplicationRow, DashboardKpis } from '@/features/dashboard/types/dashboard-stats.ts';

const percentage = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

// The figures of the dashboard's cards, given the applications of the period, the furthest stage
// of each, the total of the period before it, and today as `YYYY-MM-DD`
export function computeKpis(
  rows: ApplicationRow[],
  stages: number[],
  comparisonTotal: number | null,
  today: string
): DashboardKpis {
  const total = rows.length;

  const rejected = rows.filter((row) => row.currentStatus === JobApplicationStatus.Rejected).length;
  // A rejection is an answer too, even one that came before any interview
  const responded = rows.filter(
    (row, index) =>
      stages[index] >= SCREENING_STAGE ||
      row.currentStatus === JobApplicationStatus.Rejected ||
      row.historyStatuses.includes(JobApplicationStatus.Rejected)
  ).length;
  const interviews = stages.filter((stage) => stage >= INTERVIEW_STAGE).length;
  const offers = stages.filter((stage) => stage >= OFFER_STAGE).length;
  const ghosted = rows.filter(
    (row) => row.currentStatus === JobApplicationStatus.NoResponse
  ).length;

  return {
    total,
    thisMonth: rows.filter((row) => row.appliedAt.startsWith(today.slice(0, 7))).length,
    comparisonTotal,
    active: rows.filter((row) => IN_PROGRESS_STATUSES.includes(row.currentStatus)).length,
    awaitingReply: rows.filter((row) => row.currentStatus === JobApplicationStatus.Applied).length,
    responseRate: percentage(responded, total),
    rejectionRate: percentage(rejected, total),
    interviews,
    interviewRate: percentage(interviews, total),
    offers,
    offerRate: percentage(offers, total),
    ghosted,
    ghostedRate: percentage(ghosted, total),
  };
}
