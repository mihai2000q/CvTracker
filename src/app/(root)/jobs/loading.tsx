import React from 'react';
import { Skeleton } from '@/components/ui/skeleton.tsx';

// The same shares as the table's columns, so the rows line up with it once it loads
const ROW_COLUMNS =
  'grid grid-cols-[32fr_16fr_20fr_12fr_10fr] 2xl:grid-cols-[32fr_16fr_20fr_12fr_10fr_10fr] items-center gap-5 px-5';

// The later tabs drop out first as the screen gets narrower
const TAB_VISIBILITY = [
  '',
  '',
  '',
  'hidden sm:block',
  'hidden sm:block',
  'hidden lg:block',
  'hidden lg:block',
  'hidden xl:block',
];

const JobApplicationsLoading = () => {
  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <header className={'flex flex-col'}>
        <Skeleton className={'my-1 h-6 w-48'} />
        <Skeleton className={'my-0.5 h-3 w-60'} />
      </header>

      <main className={'flex flex-1 flex-col gap-4'}>
        <div className={'flex h-9 items-center gap-6 border-b'}>
          {TAB_VISIBILITY.map((visibility, index) => (
            <Skeleton key={index} className={`h-4 w-20 ${visibility}`} />
          ))}
        </div>

        <div className={'flex flex-row flex-wrap gap-4'}>
          <Skeleton className={'h-10 min-w-48 flex-1'} />
          <Skeleton className={'h-10 w-full sm:w-50'} />
          <Skeleton className={'h-10 w-full sm:w-40'} />
          <Skeleton className={'h-10 w-full sm:w-43'} />
          <Skeleton className={'h-10 w-full sm:w-40'} />
        </div>

        <div aria-hidden>
          <div className={`${ROW_COLUMNS} border-b py-4`}>
            <Skeleton className={'h-4 w-32'} />
            <Skeleton className={'h-4 w-16'} />
            <Skeleton className={'h-4 w-20'} />
            <Skeleton className={'h-4 w-14'} />
            <Skeleton className={'hidden h-4 w-24 2xl:block'} />
            <Skeleton className={'h-4 w-12'} />
          </div>

          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className={`${ROW_COLUMNS} py-3.5`}>
              <div className={'flex items-center gap-4'}>
                <Skeleton className={'size-10 shrink-0 rounded-xl'} />
                <div className={'flex flex-1 flex-col gap-2'}>
                  <Skeleton className={'h-4 w-3/4'} />
                  <Skeleton className={'h-3 w-1/2'} />
                </div>
              </div>
              <div className={'flex flex-col gap-2'}>
                <Skeleton className={'h-3 w-3/4'} />
                <Skeleton className={'h-3 w-1/2'} />
              </div>
              <div className={'flex flex-col gap-2'}>
                <Skeleton className={'h-3 w-3/4'} />
                <Skeleton className={'h-3 w-2/3'} />
              </div>
              <Skeleton className={'h-6 w-20 rounded-md'} />
              <Skeleton className={'hidden h-5 w-24 rounded-md 2xl:block'} />
              <Skeleton className={'h-3 w-12'} />
            </div>
          ))}
        </div>
      </main>

      <div className={'flex flex-wrap items-center justify-between gap-2 pt-4'}>
        <Skeleton className={'h-3 w-48'} />
        <Skeleton className={'h-9 w-64'} />
      </div>
    </div>
  );
};

export default JobApplicationsLoading;
