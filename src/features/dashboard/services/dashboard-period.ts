import { Temporal } from 'temporal-polyfill';
import type { DashboardSearchParamsState } from '@/features/dashboard/schemas/dashboard-search-params.ts';
import type {
  DashboardPeriod,
  DashboardRange,
} from '@/features/dashboard/types/dashboard-filtering.ts';

type Day = Temporal.PlainDate;

// The first and last day of each range, given today. None for the one that has no bounds
const RANGE_DAYS: Record<
  Exclude<DashboardRange, 'custom'>,
  (today: Day) => { from: Day; to: Day } | null
> = {
  '30d': (today) => ({ from: today.subtract({ days: 29 }), to: today }),
  '90d': (today) => ({ from: today.subtract({ days: 89 }), to: today }),
  '12m': (today) => ({ from: today.subtract({ months: 12 }).add({ days: 1 }), to: today }),
  all: () => null,
  today: (today) => ({ from: today, to: today }),
  yesterday: (today) => ({ from: today.subtract({ days: 1 }), to: today.subtract({ days: 1 }) }),
  '3d': (today) => ({ from: today.subtract({ days: 2 }), to: today }),
  '7d': (today) => ({ from: today.subtract({ days: 6 }), to: today }),
  'this-week': (today) => ({ from: today.subtract({ days: today.dayOfWeek - 1 }), to: today }),
  'last-week': (today) => {
    const monday = today.subtract({ days: today.dayOfWeek - 1 });
    return { from: monday.subtract({ days: 7 }), to: monday.subtract({ days: 1 }) };
  },
  'this-month': (today) => ({ from: today.with({ day: 1 }), to: today }),
  'last-month': (today) => {
    const firstOfMonth = today.with({ day: 1 });
    return { from: firstOfMonth.subtract({ months: 1 }), to: firstOfMonth.subtract({ days: 1 }) };
  },
  'this-year': (today) => ({ from: today.with({ month: 1, day: 1 }), to: today }),
};

// The days a range of the URL stands for, which for the ones that go by today depends on the
// day it is for the user
export function resolveDashboardPeriod(
  { range, from, to }: DashboardSearchParamsState,
  today: Day
): DashboardPeriod {
  const days =
    range === 'custom' && from && to
      ? { from: Temporal.PlainDate.from(from), to: Temporal.PlainDate.from(to) }
      : RANGE_DAYS[range === 'custom' ? 'all' : range](today);

  return {
    from: days?.from.toString() ?? null,
    to: days?.to.toString() ?? null,
    today: today.toString(),
  };
}

// The period right before, as long as the same number of days, to compare this one with
export function getComparisonPeriod({ from, to, today }: DashboardPeriod): DashboardPeriod | null {
  if (!from || !to) return null;

  const start = Temporal.PlainDate.from(from);
  const days = start.until(Temporal.PlainDate.from(to), { largestUnit: 'days' }).days + 1;
  const comparisonEnd = start.subtract({ days: 1 });

  return {
    from: comparisonEnd.subtract({ days: days - 1 }).toString(),
    to: comparisonEnd.toString(),
    today,
  };
}
