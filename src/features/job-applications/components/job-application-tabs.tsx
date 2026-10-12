'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JobApplicationStatusIndicator from '@/features/job-applications/components/status/job-application-status-indicator.tsx';
import { cn } from '@/lib/utils.ts';
import { JOB_APPLICATION_STATUSES } from '@/features/job-applications/constants/job-application-statuses.ts';

interface Tab {
  value: string;
  label: string;
  count: number;
}

const tabs: Tab[] = [
  { value: 'all', label: 'All', count: 12 },
  ...Object.entries(JOB_APPLICATION_STATUSES).map(([value, { label, count }]) => ({
    value,
    label,
    count,
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

const JobApplicationTabs = () => {
  return (
    <Tabs>
      <TabsList variant={'line'}>
        {tabs
          .filter((tab) => tab.count > 0)
          .map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={'items-center gap-0 leading-none'}
            >
              <JobApplicationStatusIndicator status={tab.value} className={'mr-2'} />
              {tab.label}
              <TabCount count={tab.count} />
            </TabsTrigger>
          ))}
      </TabsList>
    </Tabs>
  );
};

export default JobApplicationTabs;
