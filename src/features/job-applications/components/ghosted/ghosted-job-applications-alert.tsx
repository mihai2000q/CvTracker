'use client';

import React from 'react';
import { RiGhostLine } from '@remixicon/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { Button } from '@/components/ui/button.tsx';
import GhostedJobApplicationsDialog from '@/features/job-applications/components/ghosted/ghosted-job-applications-dialog.tsx';
import { GHOSTED_AFTER_MONTHS } from '@/features/job-applications/constants/job-application-statuses.ts';
import type { StaleJobApplication } from '@/features/job-applications/types/job-application.ts';

const GhostedJobApplicationsAlert = ({
  jobApplications,
}: {
  jobApplications: StaleJobApplication[];
}) => {
  if (jobApplications.length === 0) return null;

  return (
    <Alert
      variant={'warning'}
      className={'flex flex-wrap items-center gap-3 rounded-xl *:[svg]:translate-y-0'}
    >
      <RiGhostLine className={'size-5 shrink-0'} />
      <div className={'min-w-0 flex-1'}>
        <AlertTitle className={'inline'}>
          {jobApplications.length}{' '}
          {jobApplications.length === 1 ? 'application has' : 'applications have'} had no update for{' '}
          {GHOSTED_AFTER_MONTHS} months.
        </AlertTitle>{' '}
        <AlertDescription className={'inline'}>They are probably ghosted.</AlertDescription>
      </div>
      <GhostedJobApplicationsDialog jobApplications={jobApplications}>
        <Button size={'sm'} variant={'outline'}>
          Review and mark
        </Button>
      </GhostedJobApplicationsDialog>
    </Alert>
  );
};

export default GhostedJobApplicationsAlert;
