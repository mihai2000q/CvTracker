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
import { deleteInterviewRound } from '@/features/job-applications/actions/delete-interview-round.ts';
import { ROUND_TYPE_LABELS } from '@/features/job-applications/constants/round-types.ts';
import { InterviewRound } from '@/features/job-applications/types/interview-round.ts';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  round: Pick<InterviewRound, 'id' | 'roundType'>;
}

const DeleteInterviewRoundAlertDialog = ({ open, onOpenChange, round }: Props) => {
  const [isPending, run] = useResultTransition();

  function handleDelete() {
    run(() => deleteInterviewRound(round.id), {
      onSuccess: () => {
        toast.add({
          type: 'success',
          title: 'Interview round deleted',
          description: ROUND_TYPE_LABELS[round.roundType],
        });
        onOpenChange(false);
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete this {ROUND_TYPE_LABELS[round.roundType]} round?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This interview round will be permanently deleted. Its contacts stay. This action cannot
            be undone.
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

export default DeleteInterviewRoundAlertDialog;
