'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiAddLine, RiDeleteBinLine, RiEdit2Line } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import CreateJobApplicationDialog from '@/features/job-applications/components/create-job-application-dialog.tsx';
import DeleteOrganizationAlertDialog from '@/features/organizations/components/delete-organization-alert-dialog.tsx';
import EditOrganizationDialog from '@/features/organizations/components/edit-organization-dialog.tsx';
import { OrganizationDetail } from '@/features/organizations/types/organization.ts';

const OrganizationActions = ({ organization }: { organization: OrganizationDetail }) => {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className={'flex w-full flex-col gap-2'}>
        <Button variant={'secondary'} onClick={() => setCreateOpen(true)}>
          <RiAddLine />
          Add job application
        </Button>

        <div className={'grid grid-cols-2 gap-2'}>
          <Button variant={'tertiary'} onClick={() => setEditOpen(true)}>
            <RiEdit2Line />
            Edit
          </Button>
          <Button variant={'destructive'} onClick={() => setDeleteOpen(true)}>
            <RiDeleteBinLine />
            Delete
          </Button>
        </div>
      </div>

      <CreateJobApplicationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        organization={organization}
      />
      <EditOrganizationDialog
        organization={organization}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteOrganizationAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        organization={organization}
        jobApplicationsCount={organization.jobApplicationsCount}
        onDeleted={() => router.replace('/organizations')}
      />
    </>
  );
};

export default OrganizationActions;
