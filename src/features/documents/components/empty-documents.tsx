import React from 'react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty.tsx';
import { RiFileTextFill } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import CreateDocumentDialog from '@/features/documents/components/create-document-dialog.tsx';
import CreateJobApplicationDialog from '@/features/job-applications/components/create-job-application-dialog.tsx';

const EmptyDocuments = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiFileTextFill />
        </EmptyMedia>
        <EmptyTitle>No documents yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t added any documents yet. Get started by archiving your first document.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <CreateDocumentDialog>
          <Button>Add Document</Button>
        </CreateDocumentDialog>
        <CreateJobApplicationDialog>
          <Button variant="outline">Create Job Application</Button>
        </CreateJobApplicationDialog>
      </EmptyContent>
    </Empty>
  );
};

export default EmptyDocuments;
