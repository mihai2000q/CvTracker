import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import OutcomesChart from '@/features/dashboard/components/outcomes-chart.tsx';
import { getDashboardStats } from '@/features/dashboard/queries/get-dashboard-stats.ts';
import type { DashboardPeriod } from '@/features/dashboard/types/dashboard-filtering.ts';

const OutcomesCard = async ({ period }: { period: DashboardPeriod }) => {
  const { statusCounts, kpis } = await getDashboardStats(period);
  const present = statusCounts.filter(({ count }) => count > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Outcomes</CardTitle>
        <CardDescription>Where your applications stand now</CardDescription>
      </CardHeader>
      <CardContent className="gap-4">
        <OutcomesChart data={present} total={kpis.total} />
      </CardContent>
    </Card>
  );
};

export default OutcomesCard;
