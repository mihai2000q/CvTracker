import { Skeleton } from '@/components/ui/skeleton.tsx';

const AppSidebarUserSkeleton = () => (
  <div className={'flex items-center gap-2 p-2'}>
    <Skeleton className={'size-8 shrink-0 rounded-lg'} />
    <div className={'flex flex-1 flex-col gap-1.5 group-data-[state=collapsed]:hidden'}>
      <Skeleton className={'h-3.5 w-24'} />
      <Skeleton className={'h-3 w-32'} />
    </div>
  </div>
);

export default AppSidebarUserSkeleton;
