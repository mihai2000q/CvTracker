'use client';

import React from 'react';
import { RiEarthFill } from '@remixicon/react';
import Link from 'next/link';
import PastDate from '@/components/date/past-date.tsx';
import OrganizationAvatar from '@/features/organizations/components/organization/organization-avatar.tsx';
import JobApplicationStatusBadge from '@/features/job-applications/components/status/job-application-status-badge.tsx';
import InfiniteScrollList from '@/features/dashboard/components/infinite-scroll-list.tsx';
import { queryKeys } from '@/lib/query-keys.ts';
import type { CursorPage } from '@/lib/pagination.ts';
import type { RecentActivityItem } from '@/features/dashboard/types/recent-activity.ts';

interface Props {
  initialPage: CursorPage<RecentActivityItem>;
  // The days of the period, which the pages after the first are of too
  params: { from?: string; to?: string };
}

const RecentActivityList = ({ initialPage, params }: Props) => (
  <InfiniteScrollList
    queryKey={queryKeys.dashboardRecentActivity}
    endpoint="/api/dashboard/recent-activity"
    params={params}
    initialPage={initialPage}
    renderItem={({ status, changedAt, jobApplication }) => (
      <Link
        href={`/jobs/${jobApplication.id}`}
        className="hover:bg-accent/60 focus-visible:ring-ring/50 flex items-center gap-3 rounded-md px-2 py-2 text-sm outline-none focus-visible:ring-3"
      >
        <OrganizationAvatar
          organization={jobApplication.organization}
          variant="outline"
          className="size-9 shrink-0"
          letterClassName="text-sm"
        />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-medium">{jobApplication.title}</span>
          <span className="text-muted-foreground flex items-center gap-1.5 truncate text-xs">
            <span className="truncate">{jobApplication.organization.name}</span>
            <span className="lg-xl:flex flex items-center gap-1.5 truncate max-sm:hidden md:hidden xl:hidden 2xl:flex">
              ·
              <RiEarthFill className="size-3.5 shrink-0" />
              <span className="truncate">{jobApplication.country.name}</span>
            </span>
          </span>
          <PastDate date={changedAt} className="text-muted-foreground self-start text-xs" />
        </span>
        <JobApplicationStatusBadge status={status} className="shrink-0" />
      </Link>
    )}
  />
);

export default RecentActivityList;
