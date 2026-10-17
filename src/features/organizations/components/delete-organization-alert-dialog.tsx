'use client';

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx';
import { toast } from '@/components/ui/toast.tsx';
import { useResultTransition } from '@/hooks/use-result-transition.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import { deleteOrganization } from '@/features/organizations/actions/delete-organization.ts';
import { Organization } from '@/features/organizations/types/organization.ts';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Pick<Organization, 'id' | 'name'>;
  jobApplicationsCount: number;
  onDeleted?: () => void;
}

const DeleteOrganizationAlertDialog = ({
  open,
  onOpenChange,
  organization,
  jobApplicationsCount,
  onDeleted,
}: Props) => {
  const queryClient = useQueryClient();
  const [isPending, run] = useResultTransition();
  const jobsCount = jobApplicationsCount;

  function handleDelete() {
    run(() => deleteOrganization(organization.id), {
      onSuccess: async () => {
        toast.add({
          type: 'success',
          title: 'Organization deleted',
          description: organization.name,
        });
        onOpenChange(false);
        onDeleted?.();
        await queryClient.invalidateQueries({ queryKey: queryKeys.organizations });
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {organization.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            {jobsCount > 0 ? (
              <>
                This will also permanently delete{' '}
                <b>
                  {jobsCount} job {jobsCount === 1 ? 'application' : 'applications'}
                </b>{' '}
                sent to this organization, with their interview rounds. This action cannot be
                undone.
              </>
            ) : (
              'This organization will be permanently deleted. This action cannot be undone.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={'destructive'} loading={isPending} onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteOrganizationAlertDialog;
