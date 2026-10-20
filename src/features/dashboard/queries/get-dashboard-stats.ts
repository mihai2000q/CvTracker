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
import { Temporal } from 'temporal-polyfill';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { getComparisonPeriod } from '@/features/dashboard/services/dashboard-period.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import {
  IN_PROGRESS_STATUSES,
  JOB_APPLICATION_STATUS_ORDER,
} from '@/features/job-applications/constants/job-application-statuses.ts';
import type { DashboardPeriod } from '@/features/dashboard/types/dashboard-filtering.ts';
import type {
  DashboardStats,
  FunnelStage,
  TimeBucket,
} from '@/features/dashboard/types/dashboard-stats.ts';

interface ApplicationRow {
  currentStatus: string;
  // A day, as `YYYY-MM-DD`
  appliedAt: string;
  // Every status the application has had, from its history
  historyStatuses: string[];
}

// The stages an application goes through, in order. How far one got is the furthest of them it
// ever had, so an application that was rejected after an interview still counts as having
// reached the interview
const PIPELINE: readonly JobApplicationStatus[] = [
  JobApplicationStatus.Applied,
  JobApplicationStatus.Screening,
  JobApplicationStatus.Interview,
  JobApplicationStatus.Offer,
];

const SCREENING_STAGE = PIPELINE.indexOf(JobApplicationStatus.Screening);
const INTERVIEW_STAGE = PIPELINE.indexOf(JobApplicationStatus.Interview);
const OFFER_STAGE = PIPELINE.indexOf(JobApplicationStatus.Offer);

export async function getDashboardStats(period: DashboardPeriod): Promise<DashboardStats> {
  const userId = getUserId(await verifySession());
  return getDashboardStatsQuery(userId, period);
}

// The applications of a user that were applied to between two days, both included, or from the
// first or until the last one when a day is left out
function appliedBetween(userId: string, { from, to }: Pick<DashboardPeriod, 'from' | 'to'>) {
  let applications = db.JobApplication.where({ userId: uuid(userId) });
  if (from) {
    const start = Temporal.PlainDate.from(from);
    applications = applications.where((application) => application.appliedAt.gte(start));
  }
  if (to) {
    const end = Temporal.PlainDate.from(to);
    applications = applications.where((application) => application.appliedAt.lte(end));
  }
  return applications;
}

// The stats of the applications that were applied to in the period, which is all that is read and
// all that is kept: the applications of the period with the statuses they have had, and how many
// there were in the period before it
async function getDashboardStatsQuery(
  userId: string,
  period: DashboardPeriod
): Promise<DashboardStats> {
  'use cache';
  cacheTag(cacheTags.jobApplications(userId));

  const comparisonPeriod = getComparisonPeriod(period);
  const [applications, comparison] = await Promise.all([
    appliedBetween(userId, period)
      .select('id', 'currentStatus', 'appliedAt')
      .include('statusHistory', (changes) => changes.select('status'))
      .all(),
    comparisonPeriod
      ? appliedBetween(userId, comparisonPeriod).aggregate((aggregate) => ({
          total: aggregate.count(),
        }))
      : null,
  ]);

  return computeStats(
    applications.map((application) => ({
      currentStatus: application.currentStatus,
      appliedAt: application.appliedAt.toString(),
      historyStatuses: application.statusHistory.map((change) => change.status),
    })),
    comparison?.total ?? null,
    period
  );
}

const furthestStage = ({ currentStatus, historyStatuses }: ApplicationRow) =>
  Math.max(
    0,
    ...[currentStatus, ...historyStatuses].map((status) =>
      PIPELINE.indexOf(status as JobApplicationStatus)
    )
  );

const percentage = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

function computeStats(
  rows: ApplicationRow[],
  comparisonTotal: number | null,
  period: DashboardPeriod
): DashboardStats {
  const total = rows.length;
  const stages = rows.map(furthestStage);

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

  const funnel: FunnelStage[] = PIPELINE.map((status, index) => ({
    status,
    count: stages.filter((stage) => stage >= index).length,
  }));

  const statusCounts = JOB_APPLICATION_STATUS_ORDER.map((status) => ({
    status,
    count: rows.filter((row) => row.currentStatus === status).length,
  }));

  return {
    kpis: {
      total,
      thisMonth: rows.filter((row) => row.appliedAt.startsWith(period.today.slice(0, 7))).length,
      comparisonTotal,
      active: rows.filter((row) => IN_PROGRESS_STATUSES.includes(row.currentStatus)).length,
      awaitingReply: rows.filter((row) => row.currentStatus === JobApplicationStatus.Applied)
        .length,
      responseRate: percentage(responded, total),
      rejectionRate: percentage(rejected, total),
      interviews,
      interviewRate: percentage(interviews, total),
      offers,
      offerRate: percentage(offers, total),
      ghosted,
      ghostedRate: percentage(ghosted, total),
    },
    funnel,
    statusCounts,
    applicationsOverTime: bucketApplications(
      rows.map((row) => parseISO(row.appliedAt)),
      period
    ),
  };
}

type BucketUnit = 'day' | 'week' | 'month';

// Days for a month or less, weeks for up to about six months, months for what is longer
const bucketUnitFor = (days: number): BucketUnit =>
  days <= 31 ? 'day' : days <= 183 ? 'week' : 'month';

function bucketApplications(appliedDates: Date[], period: DashboardPeriod): TimeBucket[] {
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
