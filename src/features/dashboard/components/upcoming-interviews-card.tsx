import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import UpcomingInterviewsList from '@/features/dashboard/components/upcoming-interviews-list.tsx';
import { getUpcomingInterviews } from '@/features/dashboard/queries/get-upcoming-interviews.ts';

const UpcomingInterviewsCard = async () => {
  const result = await getUpcomingInterviews({});
  if (!result.success) {
    throw new Error('The upcoming interviews could not be loaded');
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upcoming interviews</CardTitle>
        <CardDescription>The next rounds you have scheduled</CardDescription>
      </CardHeader>
      <CardContent>
        {result.data.items.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">No interviews scheduled</p>
        ) : (
          <UpcomingInterviewsList initialPage={result.data} />
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingInterviewsCard;
