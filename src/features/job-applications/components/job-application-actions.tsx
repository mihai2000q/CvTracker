'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiDeleteBinLine, RiEdit2Line } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import DeleteJobApplicationAlertDialog from '@/features/job-applications/components/delete-job-application-alert-dialog.tsx';
import EditJobApplicationDialog from '@/features/job-applications/components/edit-job-application-dialog.tsx';
import { JobApplication } from '@/features/job-applications/types/job-application.ts';

const JobApplicationActions = ({ jobApplication }: { jobApplication: JobApplication }) => {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // Starts the edit over when the application changes, so it never opens on what it was
  const editKey = [
    jobApplication.title,
    jobApplication.postingUrl,
    jobApplication.source,
    jobApplication.appliedAt,
    jobApplication.notes,
    jobApplication.organization.id,
    jobApplication.country.id,
    jobApplication.cv.id,
    jobApplication.coverLetter?.id,
  ].join('|');

  return (
    <>
      <div className={'flex items-center gap-2'}>
        <Button
          variant={'tertiary'}
          size={'icon'}
          aria-label={'Edit job application'}
          title={'Edit'}
          onClick={() => setEditOpen(true)}
        >
          <RiEdit2Line />
        </Button>
        <Button
          variant={'destructive'}
          size={'icon'}
          aria-label={'Delete job application'}
          title={'Delete'}
          onClick={() => setDeleteOpen(true)}
        >
          <RiDeleteBinLine />
        </Button>
      </div>

      <EditJobApplicationDialog
        key={editKey}
        jobApplication={jobApplication}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteJobApplicationAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        jobApplication={jobApplication}
        onDeleted={() => router.replace('/jobs')}
      />
    </>
  );
};

export default JobApplicationActions;
