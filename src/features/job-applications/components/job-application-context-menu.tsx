'use client';

import React, { useState } from 'react';
import ScheduleInterviewDialog from '@/features/job-applications/components/interview/schedule-interview-dialog.tsx';
import Link from 'next/link';
import {
  RiCalendarEventLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiExternalLinkLine,
  RiCheckLine,
  RiLoopRightLine,
} from '@remixicon/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu.tsx';
import JobApplicationStatusIndicator from '@/features/job-applications/components/status/job-application-status-indicator.tsx';
import { JOB_APPLICATION_STATUSES } from '@/features/job-applications/constants/job-application-statuses.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { JobApplicationSummary } from '@/features/job-applications/types/job-application.ts';

interface Props {
  jobApplication: JobApplicationSummary;
  children: React.ReactElement;
}

const JobApplicationContextMenu = ({ jobApplication, children }: Props) => {
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger render={children} />
        <ContextMenuContent>
          <ContextMenuItem render={<Link href={`/jobs/${jobApplication.id}`} prefetch={false} />}>
            <RiEyeLine />
            View details
          </ContextMenuItem>
          <ContextMenuItem
            disabled={!jobApplication.postingUrl}
            render={
              <a
                href={jobApplication.postingUrl ?? undefined}
                target={'_blank'}
                rel={'noopener noreferrer'}
              />
            }
          >
            <RiExternalLinkLine />
            Open posting URL
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <RiLoopRightLine />
              Change status
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {Object.entries(JOB_APPLICATION_STATUSES).map(([status, { label }]) => (
                <ContextMenuItem key={status}>
                  <JobApplicationStatusIndicator status={status as JobApplicationStatus} />
                  {label}
                  {status === jobApplication.currentStatus && <RiCheckLine className={'ml-auto'} />}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem onClick={() => setScheduleOpen(true)}>
            <RiCalendarEventLine />
            Schedule interview
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem variant={'destructive'}>
            <RiDeleteBinLine />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <ScheduleInterviewDialog
        jobApplication={jobApplication}
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
      />
    </>
  );
};

export default JobApplicationContextMenu;
