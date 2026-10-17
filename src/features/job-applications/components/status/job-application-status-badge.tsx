import React from 'react';
import { cn } from '@/lib/utils.ts';
import JobApplicationStatusIndicator from '@/features/job-applications/components/status/job-application-status-indicator.tsx';
import { JOB_APPLICATION_STATUSES } from '@/features/job-applications/constants/job-application-statuses.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

interface Props extends React.ComponentProps<'div'> {
  status: JobApplicationStatus;
}

const JobApplicationStatusBadge = ({ status, className, children, ...props }: Props) => {
  return (
    <div
      data-job-application-status={status}
      className={cn(
        'flex w-fit flex-row items-center gap-2 rounded-md px-2 py-1',
        'bg-(--status-color)/20 text-xs font-bold text-(--status-color) uppercase',
        className
      )}
      {...props}
    >
      <JobApplicationStatusIndicator status={status} />
      {JOB_APPLICATION_STATUSES[status]}
      {children}
    </div>
  );
};

export default JobApplicationStatusBadge;
