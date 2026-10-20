import type { DashboardPresetRange } from '@/features/dashboard/types/dashboard-filtering.ts';

// The ones that are always in sight, in the control's segments
export const DASHBOARD_RANGE_SEGMENTS = ['30d', '90d', '12m', 'all'] as const;

// The rest, in the list next to the calendar
export const DASHBOARD_RANGE_QUICK_PICKS = [
  'today',
  'yesterday',
  '3d',
  '7d',
  'this-week',
  'last-week',
  'this-month',
  'last-month',
  'this-year',
] as const;

// Every range the dashboard can be filtered by, with the one of two days that are picked
export const DASHBOARD_RANGES = [
  ...DASHBOARD_RANGE_SEGMENTS,
  ...DASHBOARD_RANGE_QUICK_PICKS,
  'custom',
] as const;

export const DASHBOARD_RANGE_LABELS: Record<DashboardPresetRange, string> = {
  '30d': '30 days',
  '90d': '90 days',
  '12m': '12 months',
  all: 'All',
  today: 'Today',
  yesterday: 'Yesterday',
  '3d': 'Last 3 days',
  '7d': 'Last 7 days',
  'this-week': 'This week',
  'last-week': 'Last week',
  'this-month': 'This month',
  'last-month': 'Last month',
  'this-year': 'This year',
};

export const DEFAULT_DASHBOARD_RANGE: DashboardPresetRange = 'all';
