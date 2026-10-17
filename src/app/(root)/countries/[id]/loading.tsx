import React from 'react';
import { Skeleton } from '@/components/ui/skeleton.tsx';

// A section's header: the chevron, the title and its count
const SectionHeaderSkeleton = ({ titleClassName }: { titleClassName: string }) => (
  <div className={'flex items-center gap-1.5'}>
    <Skeleton className={'size-5 rounded-sm'} />
    <Skeleton className={`h-5 ${titleClassName}`} />
    <Skeleton className={'h-4 w-5'} />
  </div>
);

// What is displayed on the left and the button on the right
const SectionFooterSkeleton = () => (
  <div className={'mt-3 flex flex-wrap items-center justify-between gap-2 max-sm:flex-col'}>
    <Skeleton className={'h-3 w-44'} />
    <Skeleton className={'h-8 w-28 rounded-lg'} />
  </div>
);

const CountryLoading = () => {
  return (
    <div className={'flex flex-1 flex-col gap-8'}>
      <header className={'flex flex-col gap-5'}>
        <Skeleton className={'my-0.5 h-4 w-40'} />

        <div className={'flex items-center gap-5 max-md:flex-col'}>
          <Skeleton className={'h-14 w-20 rounded-xl'} />
          <div className={'flex flex-col gap-2 max-md:items-center'}>
            <Skeleton className={'h-8 w-56'} />
            <Skeleton className={'h-5 w-10 rounded-full'} />
          </div>
        </div>
      </header>

      <main className={'flex flex-1 flex-col gap-8'} aria-hidden>
        <section className={'flex flex-col gap-3'}>
          <SectionHeaderSkeleton titleClassName={'w-28'} />
          <ul className={'grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3'}>
            {Array.from({ length: 6 }, (_, index) => (
              <li key={index}>
                <Skeleton className={'h-[4.5rem] w-full rounded-xl'} />
              </li>
            ))}
          </ul>
          <SectionFooterSkeleton />
        </section>

        <section className={'flex flex-col gap-3'}>
          <SectionHeaderSkeleton titleClassName={'w-36'} />
          <ul className={'grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3'}>
            {Array.from({ length: 6 }, (_, index) => (
              <li key={index}>
                <Skeleton className={'h-30 w-full rounded-xl'} />
              </li>
            ))}
          </ul>
          <SectionFooterSkeleton />
        </section>
      </main>
    </div>
  );
};

export default CountryLoading;
