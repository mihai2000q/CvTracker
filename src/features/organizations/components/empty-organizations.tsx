import React from 'react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty.tsx';
import { RiBuilding2Fill } from '@remixicon/react';
import CreateOrganizationDialog from '@/features/organizations/components/create-organization-dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import CreateJobApplicationDialog from '@/features/job-applications/components/create-job-application-dialog.tsx';

const EmptyOrganizations = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiBuilding2Fill />
        </EmptyMedia>
        <EmptyTitle>No Organizations Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t added any organizations yet. Get started by creating your first
          organization or your first job application.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <CreateOrganizationDialog>
          <Button>Create Organization</Button>
        </CreateOrganizationDialog>
        <CreateJobApplicationDialog>
          <Button variant="outline">Create Job Application</Button>
        </CreateJobApplicationDialog>
      </EmptyContent>
    </Empty>
  );
};

export default EmptyOrganizations;
