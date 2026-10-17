import React from 'react';
import { Card } from '@/components/ui/card.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';

const DocumentLoading = () => {
  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <Skeleton className={'my-0.5 h-4 w-40'} />

      <div className={'grid flex-1 items-start gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]'}>
        <Card className={'items-center gap-4 px-5'}>
          <Skeleton className={'aspect-[5/6] w-28 rounded-lg'} />
          <div className={'flex w-full flex-col items-center gap-2'}>
            <Skeleton className={'h-7 w-48'} />
            <Skeleton className={'h-4 w-40'} />
            <Skeleton className={'h-3 w-36'} />
          </div>
          <Skeleton className={'h-6 w-24 rounded-md'} />
          <Skeleton className={'h-9 w-full rounded-lg'} />
          <Skeleton className={'h-9 w-full rounded-lg'} />
        </Card>

        <main className={'flex flex-col gap-3'} aria-hidden>
          <div className={'flex items-center gap-1.5'}>
            <Skeleton className={'h-5 w-20'} />
            <Skeleton className={'h-4 w-5'} />
          </div>
          <ul className={'grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3'}>
            {Array.from({ length: 6 }, (_, index) => (
              <li key={index}>
                <Skeleton className={'h-30 w-full rounded-xl'} />
              </li>
            ))}
          </ul>
          <div className={'mt-3 flex flex-wrap items-center justify-between gap-2 max-sm:flex-col'}>
            <Skeleton className={'h-3 w-44'} />
            <Skeleton className={'h-8 w-28 rounded-lg'} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocumentLoading;
