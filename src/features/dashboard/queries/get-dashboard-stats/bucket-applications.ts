import 'server-only';
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { DashboardPeriod } from '@/features/dashboard/types/dashboard-filtering.ts';
import type { TimeBucket } from '@/features/dashboard/types/dashboard-stats.ts';

type BucketUnit = 'day' | 'week' | 'month';

// Days for a month or less, weeks for up to about six months, months for what is longer
const bucketUnitFor = (days: number): BucketUnit =>
  days <= 31 ? 'day' : days <= 183 ? 'week' : 'month';

// The applications by the day, week or month they were applied to in, over the period
export function bucketApplications(appliedDates: Date[], period: DashboardPeriod): TimeBucket[] {
  const earliest = appliedDates.reduce<Date | null>(
    (min, date) => (min === null || date < min ? date : min),
    null
  );
  // A period with no start begins with the first application
  const start = period.from ? parseISO(period.from) : earliest;
  if (start === null) return [];
  const end = parseISO(period.to ?? period.today);

  const unit = bucketUnitFor(differenceInCalendarDays(end, start) + 1);
  const bucketStart = (date: Date) =>
    unit === 'month'
      ? startOfMonth(date)
      : unit === 'week'
        ? startOfWeek(date, { weekStartsOn: 1 })
        : date;
  const key = (date: Date) => format(date, 'yyyy-MM-dd');

  const starts =
    unit === 'month'
      ? eachMonthOfInterval({ start, end })
      : unit === 'week'
        ? eachWeekOfInterval({ start, end }, { weekStartsOn: 1 })
        : eachDayOfInterval({ start, end });

  const buckets = new Map<string, TimeBucket>(
    starts.map((date) => [
      key(date),
      {
        key: key(date),
        label: format(date, unit === 'month' ? 'MMM yy' : 'd MMM'),
        fullLabel:
          unit === 'month'
            ? format(date, 'MMMM yyyy')
            : unit === 'week'
              ? `Week of ${format(date, 'd MMM yyyy')}`
              : format(date, 'EEEE d MMMM yyyy'),
        count: 0,
      },
    ])
  );

  appliedDates.forEach((date) => {
    const bucket = buckets.get(key(bucketStart(date)));
    if (bucket) bucket.count += 1;
  });

  return [...buckets.values()];
}
