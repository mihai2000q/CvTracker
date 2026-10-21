'use client';

import React, { useState } from 'react';
import DeleteJobApplicationAlertDialog from '@/features/job-applications/components/delete-job-application-alert-dialog.tsx';
import { toast } from '@/components/ui/toast.tsx';
import { useResultTransition } from '@/hooks/use-result-transition.ts';
import { changeJobApplicationStatus } from '@/features/job-applications/actions/change-job-application-status.ts';
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
import {
  describeStatusChange,
  JOB_APPLICATION_STATUSES,
  NO_STATUS_CHANGE_EFFECT,
} from '@/features/job-applications/constants/job-application-statuses.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

type JobApplication = {
  id: string;
  title: string;
  currentStatus: JobApplicationStatus;
  postingUrl?: string | null;
  organization: { id: string; name: string };
};

interface Props {
  jobApplication: JobApplication;
  children: React.ReactElement;
}

const JobApplicationContextMenu = ({ jobApplication, children }: Props) => {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [, run] = useResultTransition();

  function handleStatusChange(status: JobApplicationStatus) {
    if (status === jobApplication.currentStatus) return;
    run(() => changeJobApplicationStatus({ jobApplicationId: jobApplication.id, status }), {
      onSuccess: (data) =>
        toast.add({
          type: 'success',
          title: 'Status changed',
          description: `${jobApplication.title}: ${describeStatusChange(status, data ?? NO_STATUS_CHANGE_EFFECT)}`,
        }),
    });
  }

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
              {Object.entries(JOB_APPLICATION_STATUSES).map(([status, label]) => (
                <ContextMenuItem
                  key={status}
                  onClick={() => handleStatusChange(status as JobApplicationStatus)}
                >
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

          <ContextMenuItem variant={'destructive'} onClick={() => setDeleteOpen(true)}>
            <RiDeleteBinLine />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <DeleteJobApplicationAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        jobApplication={jobApplication}
      />
      <ScheduleInterviewDialog
        jobApplication={jobApplication}
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
      />
    </>
  );
};

export default JobApplicationContextMenu;
