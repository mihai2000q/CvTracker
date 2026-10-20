import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Temporal } from 'temporal-polyfill';
import ListHeader from '@/components/list/list-header.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import EmptyJobApplications from '@/features/job-applications/components/empty-job-applications.tsx';
import GhostedJobApplicationsAlert from '@/features/job-applications/components/ghosted/ghosted-job-applications-alert.tsx';
import { countJobApplications } from '@/features/job-applications/queries/count-job-applications.ts';
import { getStaleJobApplications } from '@/features/job-applications/queries/get-stale-job-applications.ts';
import KpiCards from '@/features/dashboard/components/kpi-cards.tsx';
import ApplicationsOverTimeCard from '@/features/dashboard/components/applications-over-time-card.tsx';
import PipelineFunnelCard from '@/features/dashboard/components/pipeline-funnel-card.tsx';
import StatusBreakdownCard from '@/features/dashboard/components/status-breakdown-card.tsx';
import UpcomingInterviewsCard from '@/features/dashboard/components/upcoming-interviews-card.tsx';
import RecentActivityCard from '@/features/dashboard/components/recent-activity-card.tsx';
import {
  CardSkeleton,
  KpiCardsSkeleton,
} from '@/features/dashboard/components/dashboard-skeletons.tsx';
import DashboardPeriodControl from '@/features/dashboard/components/dashboard-period-control.tsx';
import { resolveDashboardPeriod } from '@/features/dashboard/services/dashboard-period.ts';
import { getTimeZone } from '@/lib/get-time-zone.ts';
import { readSearchParams } from '@/lib/search-params.ts';
import { dashboardSearchParamsState } from '@/features/dashboard/schemas/dashboard-search-params.ts';

export const metadata: Metadata = { title: 'Dashboard' };

const GhostedAlert = async () => (
  <GhostedJobApplicationsAlert jobApplications={await getStaleJobApplications()} />
);

const Dashboard = async ({ searchParams }: PageProps<'/dashboard'>) => {
  const { values } = readSearchParams(dashboardSearchParamsState, await searchParams);
  const timeZone = await getTimeZone();
  // One object for every card, so that the stats they share are asked for once
  const period = resolveDashboardPeriod(values, Temporal.Now.plainDateISO(timeZone));
  const total = await countJobApplications();

  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <ListHeader
        title="Dashboard"
        description="How your job search is going"
        rightSection={
          total > 0 && (
            <Suspense fallback={<Skeleton className={'h-9 w-80 rounded-full'} />}>
              <DashboardPeriodControl />
            </Suspense>
          )
        }
      />

      {total === 0 ? (
        <EmptyJobApplications />
      ) : (
        <div className={'flex flex-col gap-4'}>
          <Suspense>
            <GhostedAlert />
          </Suspense>

          <Suspense fallback={<KpiCardsSkeleton />}>
            <KpiCards period={period} />
          </Suspense>

          <div className={'grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'}>
            <div className={'md:col-span-2 lg:col-span-2'}>
              <Suspense fallback={<CardSkeleton className={'h-64 w-full'} />}>
                <ApplicationsOverTimeCard period={period} />
              </Suspense>
            </div>
            <Suspense fallback={<CardSkeleton className={'h-64 w-full'} />}>
              <PipelineFunnelCard period={period} />
            </Suspense>

            <Suspense fallback={<CardSkeleton className={'h-80 w-full'} />}>
              <StatusBreakdownCard period={period} />
            </Suspense>
            <Suspense fallback={<CardSkeleton className={'h-80 w-full'} />}>
              <UpcomingInterviewsCard />
            </Suspense>
            <Suspense fallback={<CardSkeleton className={'h-80 w-full'} />}>
              <RecentActivityCard period={period} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
