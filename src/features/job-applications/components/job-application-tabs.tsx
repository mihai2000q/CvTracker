import React from 'react';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JobApplicationStatusIndicator from '@/features/job-applications/components/status/job-application-status-indicator.tsx';
import { cn } from '@/lib/utils.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import type { JobApplicationStatusCounts } from '@/features/job-applications/types/job-application-status-counts.ts';
import type { FilterOperator } from '@/lib/filter.ts';
import type { LinkOption } from '@/lib/link-option.ts';
import type { JobApplicationFilterField } from '@/features/job-applications/constants/job-application-filtering.ts';
import { JOB_APPLICATION_STATUSES } from '@/features/job-applications/constants/job-application-statuses.ts';

interface Tab {
  value: 'all' | JobApplicationStatus;
  label: string;
  count: number;
}

const buildTabs = (counts: JobApplicationStatusCounts): Tab[] => [
  {
    value: 'all',
    label: 'All',
    count: Object.values(counts).reduce((sum, count) => sum + count, 0),
  },
  ...Object.entries(JOB_APPLICATION_STATUSES).map(([value, label]) => ({
    value: value as JobApplicationStatus,
    label,
    count: counts[value as JobApplicationStatus],
  })),
];

const TabCount = ({ count }: { count: number }) => (
  <span
    className={cn(
      'ring-muted-foreground/20 mb-0.5 ml-2 rounded-md text-xs',
      'transition-[box-shadow,margin,padding,background-color,color] duration-125',
      'group-hover/tabs-trigger:text-muted-foreground text-muted-foreground/60',
      'group-data-active/tabs-trigger:bg-accent group-data-active/tabs-trigger:text-muted-foreground',
      'group-data-active/tabs-trigger:px-1.5 group-data-active/tabs-trigger:py-px group-data-active/tabs-trigger:ring-1',
      'group-data-active/tabs-trigger:mb-1'
    )}
  >
    {count}
  </span>
);

interface Props {
  counts: JobApplicationStatusCounts;
  filterOption: (
    field: JobApplicationFilterField,
    operator: FilterOperator,
    value: unknown
  ) => Pick<LinkOption, 'href' | 'active'>;
}

// One tab per status, each a link that filters by it, and "All" to clear
const JobApplicationTabs = ({ counts, filterOption }: Props) => {
  const tabs = buildTabs(counts).map((tab) => ({
    ...tab,
    ...filterOption('status', 'eq', tab.value === 'all' ? undefined : tab.value),
  }));

  return (
    <Tabs value={tabs.find((tab) => tab.active)?.value}>
      <TabsList variant={'line'}>
        {tabs
          .filter((tab) => tab.count > 0)
          .map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              nativeButton={false}
              render={<Link href={tab.href} prefetch={false} />}
              className={'items-center gap-0 leading-none'}
            >
              {tab.value !== 'all' && (
                <JobApplicationStatusIndicator status={tab.value} className={'mr-2'} />
              )}
              {tab.label}
              <TabCount count={tab.count} />
            </TabsTrigger>
          ))}
      </TabsList>
    </Tabs>
  );
};

export default JobApplicationTabs;
