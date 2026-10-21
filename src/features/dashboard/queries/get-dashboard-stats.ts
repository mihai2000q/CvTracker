import 'server-only';
import { parseISO } from 'date-fns';
import { Temporal } from 'temporal-polyfill';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { Result } from '@/types/result.ts';
import {
  GetDashboardStatsQueryInput,
  getDashboardStatsQuerySchema,
} from '@/features/dashboard/schemas/get-dashboard-stats-schema.ts';
import { getComparisonPeriod } from '@/features/dashboard/services/dashboard-period.ts';
import { bucketApplications } from '@/features/dashboard/queries/get-dashboard-stats/bucket-applications.ts';
import {
  computeFunnel,
  furthestStage,
} from '@/features/dashboard/queries/get-dashboard-stats/compute-funnel.ts';
import { computeKpis } from '@/features/dashboard/queries/get-dashboard-stats/compute-kpis.ts';
import { JOB_APPLICATION_STATUS_ORDER } from '@/features/job-applications/constants/job-application-statuses.ts';
import type { DashboardPeriod } from '@/features/dashboard/types/dashboard-filtering.ts';
import type { ApplicationRow, DashboardStats } from '@/features/dashboard/types/dashboard-stats.ts';

export async function getDashboardStats(
  query: GetDashboardStatsQueryInput
): Promise<Result<DashboardStats>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(query, getDashboardStatsQuerySchema);
  if (!parsed.success) {
    return parsed;
  }

  return { success: true, data: await getDashboardStatsQuery(userId, parsed.data) };
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

function computeStats(
  rows: ApplicationRow[],
  comparisonTotal: number | null,
  period: DashboardPeriod
): DashboardStats {
  const stages = rows.map(furthestStage);

  return {
    kpis: computeKpis(rows, stages, comparisonTotal, period.today),
    funnel: computeFunnel(stages),
    statusCounts: JOB_APPLICATION_STATUS_ORDER.map((status) => ({
      status,
      count: rows.filter((row) => row.currentStatus === status).length,
    })),
    applicationsOverTime: bucketApplications(
      rows.map((row) => parseISO(row.appliedAt)),
      period
    ),
  };
}
