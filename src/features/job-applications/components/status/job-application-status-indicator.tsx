import React from 'react';
import { cn } from '@/lib/utils.ts';
import { getJobApplicationStatus } from '@/features/job-applications/constants/job-application-statuses.ts';

const JobApplicationStatusIndicator = ({
  status,
  className,
}: {
  status: string;
  className?: string;
}) => {
  // The tabs also pass 'all', which has no colour and so no dot
  if (!getJobApplicationStatus(status)) return null;

  return (
    <span
      data-job-application-status={status}
      className={cn(
        'shrink-0 rounded-full p-0.75',
        'bg-(--status-color) transition-colors duration-125',
        'group-[:hover:not([data-active])]/tabs-trigger:bg-[oklch(from_var(--status-color)_calc(l+0.15)_c_h)]',
        className
      )}
    />
  );
};

export default JobApplicationStatusIndicator;
