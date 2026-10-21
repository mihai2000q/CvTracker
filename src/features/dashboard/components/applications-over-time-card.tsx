import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import ApplicationsOverTimeChart from '@/features/dashboard/components/applications-over-time-chart.tsx';
import { getDashboardStats } from '@/features/dashboard/queries/get-dashboard-stats.ts';
import type { DashboardPeriod } from '@/features/dashboard/types/dashboard-filtering.ts';

const ApplicationsOverTimeCard = async ({ period }: { period: DashboardPeriod }) => {
  const result = await getDashboardStats(period);
  if (!result.success) {
    throw new Error('The dashboard stats could not be loaded');
  }
  const { applicationsOverTime } = result.data;
  const total = applicationsOverTime.reduce((sum, bucket) => sum + bucket.count, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Applications over time</CardTitle>
        <CardDescription>
          {total} {total === 1 ? 'application' : 'applications'} in this period
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {total === 0 ? (
          <p className="text-muted-foreground py-24 text-center text-sm">
            No applications in this period
          </p>
        ) : (
          <>
            <ApplicationsOverTimeChart data={applicationsOverTime} />
            <table className="sr-only">
              <caption>Applications over time</caption>
              <thead>
                <tr>
                  <th scope="col">Period</th>
                  <th scope="col">Applications</th>
                </tr>
              </thead>
              <tbody>
                {applicationsOverTime.map((bucket) => (
                  <tr key={bucket.key}>
                    <th scope="row">{bucket.fullLabel}</th>
                    <td>{bucket.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ApplicationsOverTimeCard;
