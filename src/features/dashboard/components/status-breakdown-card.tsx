import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import StatusBreakdownChart from '@/features/dashboard/components/status-breakdown-chart.tsx';
import { getDashboardStats } from '@/features/dashboard/queries/get-dashboard-stats.ts';
import type { DashboardPeriod } from '@/features/dashboard/types/dashboard-filtering.ts';

const StatusBreakdownCard = async ({ period }: { period: DashboardPeriod }) => {
  const result = await getDashboardStats(period);
  if (!result.success) {
    throw new Error('The dashboard stats could not be loaded');
  }
  const { statusCounts, kpis } = result.data;
  const present = statusCounts.filter(({ count }) => count > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Status breakdown</CardTitle>
        <CardDescription>Where your applications stand now</CardDescription>
      </CardHeader>
      <CardContent className="gap-4">
        <StatusBreakdownChart data={present} total={kpis.total} />
      </CardContent>
    </Card>
  );
};

export default StatusBreakdownCard;
