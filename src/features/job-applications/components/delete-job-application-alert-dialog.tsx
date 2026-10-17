'use client';

import React from 'react';
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
import { deleteJobApplication } from '@/features/job-applications/actions/delete-job-application.ts';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobApplication: { id: string; title: string; organization: { name: string } };
  // For an application that is no longer there to be on screen
  onDeleted?: () => void;
}

const DeleteJobApplicationAlertDialog = ({
  open,
  onOpenChange,
  jobApplication,
  onDeleted,
}: Props) => {
  const [isPending, run] = useResultTransition();

  function handleDelete() {
    run(() => deleteJobApplication(jobApplication.id), {
      onSuccess: () => {
        toast.add({
          type: 'success',
          title: 'Job application deleted',
          description: `${jobApplication.title} at ${jobApplication.organization.name}`,
        });
        onOpenChange(false);
        onDeleted?.();
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {jobApplication.title}?</AlertDialogTitle>
          <AlertDialogDescription>
            This job application will be permanently deleted, with its interview rounds and its
            status history. Its documents and its organization stay. This action cannot be undone.
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

export default DeleteJobApplicationAlertDialog;
