import React from 'react';
import { RiCalendarEventLine } from '@remixicon/react';
import { cn } from '@/lib/utils.ts';
import FutureDateTime from '@/components/date/future-date-time.tsx';
import InterviewRoundHoverCard from '@/features/job-applications/components/interview/interview-round-hover-card.tsx';
import { ROUND_TYPE_LABELS } from '@/features/job-applications/constants/round-types.ts';
import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';
import { isUpcoming } from '@/features/job-applications/lifecycle/upcoming.ts';
import { InterviewRound } from '@/features/job-applications/types/interview-round.ts';

const NextInterview = ({ rounds }: { rounds: InterviewRound[] }) => {
  const counted = rounds.filter((round) => round.outcome !== InterviewOutcome.Cancelled);
  const now = new Date();
  const next = counted.find((round) => isUpcoming(round, now)) ?? counted[counted.length - 1];
  if (!next) return null;

  return (
    <InterviewRoundHoverCard rounds={[next]}>
      <div className={'flex flex-col'}>
        <FutureDateTime
          date={next.scheduledAt}
          className={cn(
            'flex min-h-5 w-fit items-center gap-1 text-xs font-medium',
            isUpcoming(next, now) ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          <RiCalendarEventLine className={'size-3.5 shrink-0'} />
        </FutureDateTime>
        <span className={'text-muted-foreground truncate text-xs'}>
          {ROUND_TYPE_LABELS[next.roundType]}
        </span>
      </div>
    </InterviewRoundHoverCard>
  );
};

export default NextInterview;
