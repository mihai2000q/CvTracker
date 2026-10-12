import React from 'react';
import { cn } from '@/lib/utils.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

const JobApplicationStatusIndicator = ({
  status,
  className,
}: {
  status: JobApplicationStatus;
  className?: string;
}) => {
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
