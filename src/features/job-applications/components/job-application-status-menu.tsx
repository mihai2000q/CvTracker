'use client';

import React from 'react';
import { RiArrowDownSLine, RiCheckLine } from '@remixicon/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { toast } from '@/components/ui/toast.tsx';
import { useResultTransition } from '@/hooks/use-result-transition.ts';
import { cn } from '@/lib/utils.ts';
import { changeJobApplicationStatus } from '@/features/job-applications/actions/change-job-application-status.ts';
import JobApplicationStatusBadge from '@/features/job-applications/components/status/job-application-status-badge.tsx';
import JobApplicationStatusIndicator from '@/features/job-applications/components/status/job-application-status-indicator.tsx';
import {
  describeStatusChange,
  JOB_APPLICATION_STATUSES,
  NO_STATUS_CHANGE_EFFECT,
} from '@/features/job-applications/constants/job-application-statuses.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

interface Props {
  jobApplicationId: string;
  status: JobApplicationStatus;
}

const JobApplicationStatusMenu = ({ jobApplicationId, status }: Props) => {
  const [isPending, run] = useResultTransition();

  function handleChange(next: JobApplicationStatus) {
    if (next === status) return;
    run(() => changeJobApplicationStatus(jobApplicationId, next), {
      onSuccess: (data) =>
        toast.add({
          type: 'success',
          title: 'Status changed',
          description: describeStatusChange(next, data ?? NO_STATUS_CHANGE_EFFECT),
        }),
    });
  }

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
          <DropdownMenuItem key={value} onClick={() => handleChange(value as JobApplicationStatus)}>
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
