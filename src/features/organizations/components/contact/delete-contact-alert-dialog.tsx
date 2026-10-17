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
import { deleteContact } from '@/features/organizations/actions/delete-contact.ts';
import { Contact } from '@/features/organizations/types/contact.ts';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Pick<Contact, 'id' | 'name'>;
  organizationId: string;
}

const DeleteContactAlertDialog = ({ open, onOpenChange, contact, organizationId }: Props) => {
  const queryClient = useQueryClient();
  const [isPending, run] = useResultTransition();

  function handleDelete() {
    run(() => deleteContact(contact.id), {
      onSuccess: async () => {
        toast.add({ type: 'success', title: 'Contact deleted', description: contact.name });
        onOpenChange(false);
        await queryClient.invalidateQueries({
          queryKey: queryKeys.organizationContacts(organizationId),
        });
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {contact.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This contact will be permanently deleted, and removed from the interview rounds it is
            in. This action cannot be undone.
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

export default DeleteContactAlertDialog;
