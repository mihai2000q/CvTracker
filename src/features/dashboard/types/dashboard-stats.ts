import type { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

export interface DashboardKpis {
  total: number;
  // Applied to in the current calendar month
  thisMonth: number;
  // Applications of the period right before this one, as long as the same number of days. There
  // is none for a period with no start
  comparisonTotal: number | null;
  active: number;
  // Still at "applied": nothing has come back yet
  awaitingReply: number;
  // Percentages of all applications, rounded
  responseRate: number;
  rejectionRate: number;
  interviews: number;
  interviewRate: number;
  offers: number;
  offerRate: number;
  // Closed by silence, going by the current status
  ghosted: number;
  ghostedRate: number;
}

export interface FunnelStage {
  status: JobApplicationStatus;
  // The applications that got this far, whatever became of them after
  count: number;
}

export interface StatusCount {
  status: JobApplicationStatus;
  count: number;
}

export interface TimeBucket {
  // The start of the week or month it covers, as a day
  key: string;
  label: string;
  fullLabel: string;
  count: number;
}

export interface DashboardStats {
  kpis: DashboardKpis;
  funnel: FunnelStage[];
  statusCounts: StatusCount[];
  applicationsOverTime: TimeBucket[];
}

// What the stats are worked out from, for each application of the period
export interface ApplicationRow {
  currentStatus: string;
  // A day, as `YYYY-MM-DD`
  appliedAt: string;
  // Every status the application has had, from its history
  historyStatuses: string[];
}
