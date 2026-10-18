import React from 'react';
import { Card } from '@/components/ui/card.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';

const SideCardSkeleton = ({ rows }: { rows: number }) => (
  <Card className={'gap-3 p-5'}>
    <Skeleton className={'h-3 w-20'} />
    {Array.from({ length: rows }, (_, index) => (
      <Skeleton key={index} className={'h-5 w-full'} />
    ))}
  </Card>
);

const JobApplicationLoading = () => {
  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <Skeleton className={'my-0.5 h-4 w-40'} />

      <header className={'flex flex-wrap items-start justify-between gap-x-6 gap-y-4'}>
        <div className={'flex items-center gap-4'}>
          <Skeleton className={'size-14 rounded-xl'} />
          <div className={'flex flex-col gap-2'}>
            <Skeleton className={'h-8 w-72'} />
            <Skeleton className={'h-4 w-48'} />
          </div>
        </div>
        <div className={'flex items-center gap-3'}>
          <Skeleton className={'h-8 w-32 rounded-md'} />
          <Skeleton className={'h-9 w-20 rounded-lg'} />
          <Skeleton className={'h-9 w-24 rounded-lg'} />
        </div>
      </header>

      <div className={'grid flex-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]'}>
        <div className={'flex flex-col gap-8'} aria-hidden>
          <div className={'flex items-center justify-between gap-2'}>
            <div className={'flex items-center gap-1.5'}>
              <Skeleton className={'h-5 w-36'} />
              <Skeleton className={'h-4 w-5'} />
            </div>
            <Skeleton className={'h-8 w-40 rounded-lg'} />
          </div>
          {Array.from({ length: 2 }, (_, index) => (
            <Skeleton key={index} className={'h-28 w-full rounded-xl'} />
          ))}
        </div>

        <aside className={'flex flex-col gap-4'} aria-hidden>
          <SideCardSkeleton rows={5} />
          <SideCardSkeleton rows={2} />
          <SideCardSkeleton rows={3} />
        </aside>
      </div>
    </div>
  );
};

export default JobApplicationLoading;
