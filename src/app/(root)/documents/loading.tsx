import React from 'react';
import { Skeleton } from '@/components/ui/skeleton.tsx';

const DocumentsLoading = () => {
  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <header className={'flex flex-wrap items-center justify-between gap-3'}>
        <div className={'flex flex-col'}>
          <Skeleton className={'my-1 h-6 w-40'} />
          <Skeleton className={'my-0.5 h-3 w-60'} />
        </div>

        <Skeleton className={'h-9.5 w-72 rounded-full'} />
      </header>

      <main className={'flex flex-1 flex-col gap-6'}>
        <Skeleton className={'h-17 w-full rounded-xl'} />

        <ul
          role="list"
          aria-hidden
          className={'grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4'}
        >
          {Array.from({ length: 8 }, (_, index) => (
            <li key={index}>
              <Skeleton className={'aspect-[4/5] w-full rounded-xl'} />
            </li>
          ))}
        </ul>
      </main>

      <div
        className={'flex flex-wrap items-center justify-between gap-2 max-md:flex-col max-md:gap-4'}
      >
        <Skeleton className={'h-3 w-48'} />
        <Skeleton className={'h-9 w-64'} />
      </div>
    </div>
  );
};

export default DocumentsLoading;
