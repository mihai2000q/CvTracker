'use client';

import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge.tsx';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { INTERVIEW_OUTCOME_LABELS } from '@/features/job-applications/constants/interview-outcomes.ts';
import { ROUND_TYPE_LABELS } from '@/features/job-applications/constants/round-types.ts';
import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';
import { InterviewRound } from '@/features/job-applications/types/interview-round.ts';

// The year is only worth saying when it isn't this one
const formatDate = (date: Date) =>
  format(date, date.getFullYear() === new Date().getFullYear() ? 'EEE dd MMM' : 'EEE dd MMM yyyy');

const MAX_ROUNDS = 2;
const MAX_CONTACTS = 2;

// The rounds to show, starting at the next one still to come (or ending at the last when it is
// near the end), and how many are left out
function pickRounds(rounds: InterviewRound[], now: Date) {
  const upcoming = rounds.findIndex(
    (round) => round.outcome !== InterviewOutcome.Cancelled && new Date(round.scheduledAt) >= now
  );
  const next = upcoming === -1 ? rounds.length - 1 : upcoming;
  const start = Math.min(next, Math.max(rounds.length - MAX_ROUNDS, 0));
  const shown = rounds.slice(start, start + MAX_ROUNDS);
  return { shown, moreCount: rounds.length - shown.length };
}

interface Props {
  rounds: InterviewRound[];
  children: React.ReactNode;
}

const InterviewRoundHoverCard = ({ rounds, children }: Props) => {
  const { shown, moreCount } = pickRounds(rounds, new Date());

  return (
    <HoverCard>
      <HoverCardTrigger render={<div className={'w-fit'} />}>{children}</HoverCardTrigger>
      <HoverCardContent side={'top'} className={'flex max-w-90 min-w-50 flex-col gap-3'}>
        {shown.map((round, index) => (
          <React.Fragment key={round.id}>
            {index > 0 && <Separator />}
            <div className={'flex flex-col gap-0'}>
              <div className={'flex items-start justify-between gap-4'}>
                <div className={'flex min-w-0 flex-col'}>
                  <div className={'mb-0.5 flex items-center gap-1.5 whitespace-nowrap'}>
                    <span className={'text-base leading-tight font-bold'}>
                      {formatDate(new Date(round.scheduledAt))}
                    </span>
                    <Badge variant={'outline'} className={'mb-0.5 rounded-md py-2 tabular-nums'}>
                      {format(new Date(round.scheduledAt), 'HH:mm')}
                    </Badge>
                  </div>
                  <span className={'text-muted-foreground mb-0.5 text-xs leading-none'}>
                    {ROUND_TYPE_LABELS[round.roundType]}
                    {round.outcome !== InterviewOutcome.Scheduled &&
                      ` · ${INTERVIEW_OUTCOME_LABELS[round.outcome]}`}
                  </span>

                  {round.notes && (
                    <p
                      className={
                        'text-muted-foreground/60 mt-0.5 line-clamp-3 w-0 min-w-full text-[0.6875rem] italic'
                      }
                    >
                      {round.notes}
                    </p>
                  )}
                </div>

                {round.contacts.length > 0 && (
                  <div
                    className={
                      'flex shrink-0 flex-col items-end gap-0.5 text-right whitespace-nowrap'
                    }
                  >
                    {round.contacts.slice(0, MAX_CONTACTS).map((contact) => (
                      <span key={contact.id} className={'leading-tight'}>
                        <span className={'font-medium'}>{contact.name}</span>
                        {contact.role && (
                          <span className={'text-muted-foreground text-xs'}> · {contact.role}</span>
                        )}
                      </span>
                    ))}
                    {round.contacts.length > MAX_CONTACTS && (
                      <span className={'text-muted-foreground text-xs'}>
                        +{round.contacts.length - MAX_CONTACTS} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </React.Fragment>
        ))}
        {moreCount > 0 && (
          <span className={'text-muted-foreground text-xs'}>
            +{moreCount} more {moreCount === 1 ? 'round' : 'rounds'}
          </span>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

export default InterviewRoundHoverCard;
