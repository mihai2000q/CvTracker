import React from 'react';
import { Separator } from '@/components/ui/separator.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';

const DocumentsLoading = () => {
  return (
    <div className={'flex flex-1 flex-col'}>
      <header className={'flex flex-wrap items-center justify-between gap-3'}>
        <div className={'flex flex-col'}>
          <Skeleton className={'my-1 h-6 w-40'} />
          <Skeleton className={'my-0.5 h-3 w-60'} />
        </div>

        <Skeleton className={'h-10 w-80 rounded-full'} />
      </header>

      <Separator className={'mt-4 mb-3'} />

      <main className={'flex flex-1 flex-col gap-4'}>
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
    </div>
  );
};

export default DocumentsLoading;
