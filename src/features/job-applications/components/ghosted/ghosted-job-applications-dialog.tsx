'use client';

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog.tsx';
import { toast } from '@/components/ui/toast.tsx';
import OrganizationAvatar from '@/features/organizations/components/organization/organization-avatar.tsx';
import StaleJobApplicationHoverCard from '@/features/job-applications/components/ghosted/stale-job-application-hover-card.tsx';
import PastDate from '@/components/date/past-date.tsx';
import { useResultTransition } from '@/hooks/use-result-transition.ts';
import { markGhostedJobApplications } from '@/features/job-applications/actions/mark-ghosted-job-applications.ts';
import { undoGhostedJobApplications } from '@/features/job-applications/actions/undo-ghosted-job-applications.ts';
import type { GhostedUndo } from '@/features/job-applications/schemas/undo-ghosted-job-applications-schema.ts';
import {
  GHOSTED_AFTER_MONTHS,
  JOB_APPLICATION_STATUSES,
} from '@/features/job-applications/constants/job-application-statuses.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import type { StaleJobApplication } from '@/features/job-applications/types/job-application.ts';

interface Props {
  jobApplications: StaleJobApplication[];
  children: React.ReactElement;
}

const GhostedJobApplicationsDialog = ({ jobApplications, children }: Props) => {
  const [open, setOpen] = useState(false);
  const [isPending, run] = useResultTransition();
  const [isUndoing, runUndo] = useResultTransition();

  function undo(undoData: GhostedUndo, toastId: string) {
    toast.close(toastId);
    runUndo(() => undoGhostedJobApplications(undoData), {
      onSuccess: () =>
        toast.add({
          type: 'success',
          title: 'Restored',
          description: `${undoData.applications.length} applications are back to their status`,
        }),
    });
  }

  function handleMark() {
    run(markGhostedJobApplications, {
      onSuccess: (undoData) => {
        setOpen(false);
        if (!undoData || undoData.applications.length === 0) {
          toast.add({
            type: 'info',
            title: 'Nothing to mark',
            description: 'No application is silent anymore',
          });
          return;
        }
        const toastId = toast.add({
          type: 'success',
          title: `${JOB_APPLICATION_STATUSES[JobApplicationStatus.NoResponse]}`,
          description: `${undoData.applications.length} applications marked`,
          timeout: 10000,
          actionProps: {
            children: 'Undo',
            disabled: isUndoing,
            onClick: () => undo(undoData, toastId),
          },
        });
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={children} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Mark {jobApplications.length}{' '}
            {jobApplications.length === 1 ? 'application' : 'applications'} as ghosted?
          </AlertDialogTitle>
          <AlertDialogDescription>
            These are still in progress, with no update for {GHOSTED_AFTER_MONTHS} months. Each one
            moves to {JOB_APPLICATION_STATUSES[JobApplicationStatus.NoResponse]}, and it is noted in
            its status history, and its upcoming interview rounds are cancelled.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ul className={'flex max-h-60 flex-col gap-2 overflow-y-auto text-sm'}>
          {jobApplications.map((jobApplication) => (
            <li key={jobApplication.id} className={'flex items-center gap-2.5'}>
              <StaleJobApplicationHoverCard jobApplication={jobApplication}>
                <OrganizationAvatar
                  organization={jobApplication.organization}
                  variant={'outline'}
                  className={'size-7 shrink-0 rounded-md'}
                  letterClassName={'text-xs'}
                />
              </StaleJobApplicationHoverCard>
              <div className={'flex min-w-0 flex-1 flex-col leading-tight'}>
                <span className={'truncate'}>{jobApplication.title}</span>
                <span className={'text-muted-foreground truncate text-xs'}>
                  {jobApplication.organization.name}
                </span>
              </div>
              <PastDate
                date={jobApplication.lastUpdate}
                className={'text-muted-foreground shrink-0 text-xs'}
              />
            </li>
          ))}
        </ul>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction loading={isPending} onClick={handleMark}>
            Mark as {JOB_APPLICATION_STATUSES[JobApplicationStatus.NoResponse]}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GhostedJobApplicationsDialog;
