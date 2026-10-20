import type { DASHBOARD_RANGES } from '@/features/dashboard/constants/dashboard-filtering.ts';

export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

// A range that stands for days on its own, so not the custom one
export type DashboardPresetRange = Exclude<DashboardRange, 'custom'>;

// The days the dashboard is about, as `YYYY-MM-DD`, both of them included. Without either it is
// not bounded on that side; `today` is the day it is for the user, which the ranges and the end
// of an unbounded one go by
export interface DashboardPeriod {
  from: string | null;
  to: string | null;
  today: string;
}
