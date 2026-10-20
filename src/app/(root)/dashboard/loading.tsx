import React from 'react';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import {
  CardSkeleton,
  KpiCardsSkeleton,
} from '@/features/dashboard/components/dashboard-skeletons.tsx';

const DashboardLoading = () => {
  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <header className={'flex flex-col'}>
        <Skeleton className={'my-1 h-6 w-48'} />
        <Skeleton className={'my-0.5 h-3 w-60'} />
      </header>

      <div className={'flex flex-col gap-4'}>
        <KpiCardsSkeleton />
        <div className={'grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'}>
          <div className={'md:col-span-2 lg:col-span-2'}>
            <CardSkeleton className={'h-64 w-full'} />
          </div>
          <CardSkeleton className={'h-64 w-full'} />
          <CardSkeleton className={'h-80 w-full'} />
          <CardSkeleton className={'h-80 w-full'} />
          <CardSkeleton className={'h-80 w-full'} />
        </div>
      </div>
    </div>
  );
};

export default DashboardLoading;
