import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import PipelineStatusBar from '@/features/dashboard/components/pipeline-status-bar.tsx';
import { getDashboardStats } from '@/features/dashboard/queries/get-dashboard-stats.ts';
import type { DashboardPeriod } from '@/features/dashboard/types/dashboard-filtering.ts';
import { JOB_APPLICATION_STATUSES } from '@/features/job-applications/constants/job-application-statuses.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

const CLOSED_STATUSES: readonly JobApplicationStatus[] = [
  JobApplicationStatus.Rejected,
  JobApplicationStatus.Withdrawn,
  JobApplicationStatus.NoResponse,
];

const StatusBar = ({
  status,
  count,
  total,
}: {
  status: JobApplicationStatus;
  count: number;
  total: number;
}) => {
  const share = total === 0 ? 0 : Math.round((count / total) * 100);

  return (
    <li data-job-application-status={status} className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{JOB_APPLICATION_STATUSES[status]}</span>
        <span className="text-muted-foreground tabular-nums">
          {count} · {share}%
        </span>
      </div>
      <PipelineStatusBar status={status} count={count} share={share} />
    </li>
  );
};

const PipelineFunnelCard = async ({ period }: { period: DashboardPeriod }) => {
  const { funnel, statusCounts, kpis } = await getDashboardStats(period);
  const closed = statusCounts.filter(({ status }) => CLOSED_STATUSES.includes(status));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Pipeline</CardTitle>
        <CardDescription>How far your applications got, and how the others ended</CardDescription>
      </CardHeader>
      <CardContent className="gap-3">
        <ol className="flex flex-col gap-3">
          {funnel.map(({ status, count }) => (
            <StatusBar key={status} status={status} count={count} total={kpis.total} />
          ))}
        </ol>
        <Separator />
        <ul className="flex flex-col gap-3">
          {closed.map(({ status, count }) => (
            <StatusBar key={status} status={status} count={count} total={kpis.total} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PipelineFunnelCard;
