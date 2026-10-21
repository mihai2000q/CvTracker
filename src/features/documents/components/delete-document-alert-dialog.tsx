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
import { Document } from '@/features/documents/types/document.ts';
import { toast } from '@/components/ui/toast.tsx';
import { useResultTransition } from '@/hooks/use-result-transition.ts';
import { deleteDocument } from '@/features/documents/actions/delete-document.ts';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document;
  onDeleted?: () => void;
}

const DeleteDocumentAlertDialog = ({ open, onOpenChange, document, onDeleted }: Props) => {
  const [isPending, run] = useResultTransition();

  function handleDelete() {
    run(() => deleteDocument(document.id), {
      onSuccess: () => {
        toast.add({ type: 'success', title: 'Document deleted', description: document.name });
        onOpenChange(false);
        onDeleted?.();
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {document.name}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this document? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction loading={isPending} onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDocumentAlertDialog;
