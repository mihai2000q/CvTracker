import { Skeleton } from '@/components/ui/skeleton.tsx';
import { Card } from '@/components/ui/card.tsx';

const OrganizationsLoading = () => (
  <div className={'flex flex-1 flex-col gap-6'}>
    <header className={'flex flex-wrap items-center justify-between gap-3'}>
      <div className={'flex flex-col'}>
        <Skeleton className={'my-1 h-6 w-40'} />
        <Skeleton className={'my-0.5 h-3 w-100 max-w-full'} />
      </div>

      <Skeleton className={'h-9.5 w-80 rounded-full'} />
    </header>

    <div className={'flex flex-1 flex-col gap-6'}>
      <div className={'flex gap-2'}>
        <Skeleton className={'h-8 w-40'} />
        <Skeleton className={'h-8 w-56'} />
      </div>

      <div className={'flex flex-col gap-2.5'}>
        {Array.from({ length: 5 }, (_, index) => (
          <Card key={index} className={'flex-row items-center gap-4 p-4'}>
            <Skeleton className={'size-13 rounded-xl'} />
            <div className={'flex flex-col gap-1'}>
              <Skeleton className={'my-1 h-5 w-48'} />
              <Skeleton className={'my-0.5 h-4 w-64'} />
            </div>
          </Card>
        ))}
      </div>
    </div>

    <div
      className={'flex flex-wrap items-center justify-between gap-2 max-md:flex-col max-md:gap-4'}
    >
      <Skeleton className={'h-3 w-48'} />
      <Skeleton className={'h-9 w-64'} />
    </div>
  </div>
);

export default OrganizationsLoading;
