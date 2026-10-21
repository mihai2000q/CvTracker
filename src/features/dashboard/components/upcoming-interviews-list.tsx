'use client';

import React from 'react';
import { RiEarthFill } from '@remixicon/react';
import Link from 'next/link';
import FutureDateTime from '@/components/date/future-date-time.tsx';
import OrganizationAvatar from '@/features/organizations/components/organization/organization-avatar.tsx';
import InfiniteScrollList from '@/components/list/infinite-scroll-list.tsx';
import { ROUND_TYPE_LABELS } from '@/features/job-applications/constants/round-types.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import type { CursorPage } from '@/lib/pagination.ts';
import type { UpcomingInterview } from '@/features/dashboard/types/upcoming-interview.ts';

const UpcomingInterviewsList = ({
  initialPage,
}: {
  initialPage: CursorPage<UpcomingInterview>;
}) => (
  <InfiniteScrollList
    queryKey={queryKeys.dashboardUpcomingInterviews}
    endpoint="/api/dashboard/upcoming-interviews"
    initialPage={initialPage}
    renderItem={({ roundType, scheduledAt, jobApplication }) => (
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
          <span className="text-muted-foreground text-xs">
            {ROUND_TYPE_LABELS[roundType]} · <FutureDateTime date={scheduledAt} />
          </span>
        </span>
      </Link>
    )}
  />
);

export default UpcomingInterviewsList;
