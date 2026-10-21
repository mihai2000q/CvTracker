'use client';

import React, { useState } from 'react';
import {
  RiCheckLine,
  RiDeleteBinLine,
  RiEdit2Line,
  RiFlagLine,
  RiMoreLine,
} from '@remixicon/react';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { toast } from '@/components/ui/toast.tsx';
import LocalDateTime from '@/components/date/local-date-time.tsx';
import { useResultTransition } from '@/hooks/use-result-transition.ts';
import { cn } from '@/lib/utils.ts';
import { changeJobApplicationStatus } from '@/features/job-applications/actions/change-job-application-status.ts';
import { setInterviewOutcome } from '@/features/job-applications/actions/set-interview-outcome.ts';
import DeleteInterviewRoundAlertDialog from '@/features/job-applications/components/interview/delete-interview-round-alert-dialog.tsx';
import EditInterviewRoundDialog from '@/features/job-applications/components/interview/edit-interview-round-dialog.tsx';
import InterviewOutcomeBadge from '@/features/job-applications/components/interview/interview-outcome-badge.tsx';
import { describeStatusChange } from '@/features/job-applications/constants/job-application-statuses.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { INTERVIEW_OUTCOME_LABELS } from '@/features/job-applications/constants/interview-outcomes.ts';
import { ROUND_TYPE_LABELS } from '@/features/job-applications/constants/round-types.ts';
import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';
import { InterviewRound } from '@/features/job-applications/types/interview-round.ts';

interface Props {
  jobApplicationId: string;
  round: InterviewRound;
  organizationId: string;
}

const InterviewRoundItem = ({ round, organizationId, jobApplicationId }: Props) => {
  const [isPending, run] = useResultTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isCancelled = round.outcome === InterviewOutcome.Cancelled;
  // Starts the edit over when the round changes, so it never opens on what it was
  const editKey = [
    round.roundType,
    round.scheduledAt,
    round.notes,
    round.contacts.map((contact) => contact.id).join(),
  ].join('|');

  const roundName = ROUND_TYPE_LABELS[round.roundType];

  // The round failed and another is still to come: it is up to the user
  async function rejectAfterFailedRound() {
    const result = await changeJobApplicationStatus({
      jobApplicationId,
      status: JobApplicationStatus.Rejected,
      note: `${roundName} round failed`,
    });
    toast.add({
      type: result.success ? 'success' : 'error',
      title: result.success ? 'Status changed' : 'Something went wrong',
      description: result.success
        ? describeStatusChange(JobApplicationStatus.Rejected, result.data)
        : Object.values(result.errors).flat().join(' '),
    });
  }

  function handleOutcome(outcome: InterviewOutcome) {
    if (outcome === round.outcome) return;
    run(() => setInterviewOutcome(round.id, outcome), {
      onSuccess: (effect) => {
        const description = `${roundName}: ${INTERVIEW_OUTCOME_LABELS[outcome]}`;
        if (effect?.rejected) {
          toast.add({
            type: 'success',
            title: 'Outcome set, status moved to Rejected',
            description,
          });
        } else if (effect?.suggestRejection) {
          const suggestionId = toast.add({
            type: 'info',
            title: 'Outcome set',
            description: `${description}. Another round is still to come: reject this application?`,
            timeout: 10000,
            actionProps: {
              children: 'Move to Rejected',
              onClick: () => {
                // The question is answered, so it goes away
                toast.close(suggestionId);
                void rejectAfterFailedRound();
              },
            },
          });
        } else {
          toast.add({ type: 'success', title: 'Outcome set', description });
        }
      },
    });
  }

  return (
    <>
      <Card
        className={cn('gap-3 p-4 transition-opacity', isPending && 'opacity-60')}
        data-interview-outcome={round.outcome}
      >
        <div className={'flex items-start justify-between gap-3'}>
          <div className={'flex min-w-0 flex-col gap-1'}>
            <div className={'flex flex-wrap items-center gap-2'}>
              <LocalDateTime
                date={round.scheduledAt}
                pattern={'EEE dd MMM yyyy'}
                className={cn(
                  'text-base leading-tight font-bold',
                  isCancelled && 'text-muted-foreground line-through'
                )}
              />
              <Badge variant={'outline'} className={'rounded-md tabular-nums'}>
                <LocalDateTime date={round.scheduledAt} pattern={'HH:mm'} />
              </Badge>
            </div>
            <div className={'flex flex-wrap items-center gap-2'}>
              <span className={'text-muted-foreground text-sm'}>
                {ROUND_TYPE_LABELS[round.roundType]}
              </span>
              <InterviewOutcomeBadge outcome={round.outcome} />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant={'ghost'}
                  size={'icon-sm'}
                  aria-label={`Actions for the ${ROUND_TYPE_LABELS[round.roundType]} round`}
                  className={'-mt-1 -mr-1 shrink-0'}
                />
              }
            >
              <RiMoreLine />
            </DropdownMenuTrigger>
            <DropdownMenuContent align={'end'} className={'min-w-40'}>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <RiFlagLine />
                  Set outcome
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {Object.values(InterviewOutcome).map((outcome) => (
                    <DropdownMenuItem key={outcome} onClick={() => handleOutcome(outcome)}>
                      {INTERVIEW_OUTCOME_LABELS[outcome]}
                      {outcome === round.outcome && <RiCheckLine className={'ml-auto'} />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <RiEdit2Line />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant={'destructive'} onClick={() => setDeleteOpen(true)}>
                <RiDeleteBinLine />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {round.contacts.length > 0 && (
          <ul role="list" className={'flex flex-wrap gap-x-4 gap-y-1 text-sm'}>
            {round.contacts.map((contact) => (
              <li key={contact.id} className={'min-w-0 truncate'}>
                <span className={'font-medium'}>{contact.name}</span>
                {contact.role && (
                  <span className={'text-muted-foreground text-xs'}> · {contact.role}</span>
                )}
              </li>
            ))}
          </ul>
        )}

        {round.notes && (
          <p className={'text-muted-foreground text-sm whitespace-pre-line italic'}>
            {round.notes}
          </p>
        )}
      </Card>

      <EditInterviewRoundDialog
        key={editKey}
        round={round}
        organizationId={organizationId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteInterviewRoundAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        round={round}
      />
    </>
  );
};

export default InterviewRoundItem;
