import React from 'react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty.tsx';
import { RiBriefcase4Fill } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import CreateJobApplicationDialog from '@/features/job-applications/components/create-job-application-dialog.tsx';

const EmptyJobApplications = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiBriefcase4Fill />
        </EmptyMedia>
        <EmptyTitle>No job applications yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t added any applications yet. Get started by creating your first job
          application.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="justify-center">
        <CreateJobApplicationDialog>
          <Button>Create Job Application</Button>
        </CreateJobApplicationDialog>
      </EmptyContent>
    </Empty>
  );
};

export default EmptyJobApplications;
