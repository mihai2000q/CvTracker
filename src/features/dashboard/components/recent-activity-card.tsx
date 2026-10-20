import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import RecentActivityList from '@/features/dashboard/components/recent-activity-list.tsx';
import { getRecentActivity } from '@/features/dashboard/queries/get-recent-activity.ts';
import type { DashboardPeriod } from '@/features/dashboard/types/dashboard-filtering.ts';

const RecentActivityCard = async ({ period }: { period: DashboardPeriod }) => {
  const params = { from: period.from ?? undefined, to: period.to ?? undefined };
  const result = await getRecentActivity(params);
  if (!result.success) {
    throw new Error('The recent activity could not be loaded');
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>The latest status changes</CardDescription>
      </CardHeader>
      <CardContent>
        {result.data.items.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">Nothing yet</p>
        ) : (
          <RecentActivityList initialPage={result.data} params={params} />
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
