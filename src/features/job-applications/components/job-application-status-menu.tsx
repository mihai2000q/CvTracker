'use client';

import React from 'react';
import { RiArrowDownSLine, RiCheckLine } from '@remixicon/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { cn } from '@/lib/utils.ts';
import { useChangeJobApplicationStatus } from '@/features/job-applications/hooks/use-change-job-application-status.ts';
import JobApplicationStatusBadge from '@/features/job-applications/components/status/job-application-status-badge.tsx';
import JobApplicationStatusIndicator from '@/features/job-applications/components/status/job-application-status-indicator.tsx';
import { JOB_APPLICATION_STATUSES } from '@/features/job-applications/constants/job-application-statuses.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

interface Props {
  jobApplicationId: string;
  status: JobApplicationStatus;
}

const JobApplicationStatusMenu = ({ jobApplicationId, status }: Props) => {
  const [isPending, changeStatus] = useChangeJobApplicationStatus({
    jobApplicationId,
    currentStatus: status,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={'Change status'}
        nativeButton={false}
        render={
          <JobApplicationStatusBadge
            status={status}
            className={cn(
              'focus-visible:ring-ring cursor-pointer py-1.5 pr-1.5 outline-none focus-visible:ring-2',
              'transition-colors hover:bg-(--status-color)/30',
              isPending && 'pointer-events-none opacity-60'
            )}
          >
            <RiArrowDownSLine className={'size-4'} />
          </JobApplicationStatusBadge>
        }
      />
      <DropdownMenuContent align={'start'}>
        {Object.entries(JOB_APPLICATION_STATUSES).map(([value, label]) => (
          <DropdownMenuItem key={value} onClick={() => changeStatus(value as JobApplicationStatus)}>
            <JobApplicationStatusIndicator status={value as JobApplicationStatus} />
            {label}
            {value === status && <RiCheckLine className={'ml-auto'} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default JobApplicationStatusMenu;
