import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarLink,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar.tsx';
import { RiBriefcase4Fill, RiDashboardFill, RiDashboardLine } from '@remixicon/react';
import { cn } from '@/lib/utils.ts';
import AppSidebarCore, { AppSidebarCoreWithCounts } from '@/components/layout/app-sidebar-core.tsx';
import AppSidebarUser from '@/components/layout/app-sidebar-user.tsx';
import { Suspense } from 'react';
import AppSidebarUserSkeleton from '@/components/layout/app-sidebar-user-skeleton.tsx';

const AppSidebar = () => {
  return (
    <Sidebar collapsible={'icon'}>
      <SidebarHeader>
        <SidebarMenuItem
          className={cn(
            'flex flex-row items-center gap-2 p-3 transition-[padding] group-data-[state=collapsed]:p-0'
          )}
        >
          <div
            className={cn(
              'flex aspect-square size-8 items-center justify-center',
              'bg-sidebar-primary text-sidebar-primary-foreground rounded-lg'
            )}
          >
            <RiBriefcase4Fill className={'size-4.5 fill-white'} />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">CV Tracker</span>
            <span className="text-muted-foreground truncate text-xs">Track your job hunt</span>
          </div>
        </SidebarMenuItem>
      </SidebarHeader>
      <SidebarSeparator />

      <SidebarContent className={'pt-1.5'}>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarLink
                href={'/dashboard'}
                icon={<RiDashboardLine />}
                activeIcon={<RiDashboardFill />}
              >
                Dashboard
              </SidebarLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <Suspense fallback={<AppSidebarCore />}>
          <AppSidebarCoreWithCounts />
        </Suspense>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <Suspense fallback={<AppSidebarUserSkeleton />}>
          <AppSidebarUser />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
