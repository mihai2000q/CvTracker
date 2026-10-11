import React from 'react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty.tsx';
import { RiGlobalFill } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import CreateJobApplicationDialog from '@/features/job-applications/components/create-job-application-dialog.tsx';

const EmptyCountries = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiGlobalFill />
        </EmptyMedia>
        <EmptyTitle>No Applications Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t added any job application yet. Get started by creating your first job
          application.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <CreateJobApplicationDialog>
          <Button>Create Job Application</Button>
        </CreateJobApplicationDialog>
      </EmptyContent>
    </Empty>
  );
};

export default EmptyCountries;
