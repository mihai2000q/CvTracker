import React from 'react';
import { RiCheckLine, RiCloseLine, RiForbidLine } from '@remixicon/react';
import { cn } from '@/lib/utils.ts';
import { INTERVIEW_OUTCOME_LABELS } from '@/features/job-applications/constants/interview-outcomes.ts';
import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';

// What each outcome looks like. A round that is still scheduled has no badge: there is
// nothing to tell yet
const OUTCOME_STYLES: Partial<
  Record<InterviewOutcome, { icon: React.ReactNode; className: string }>
> = {
  [InterviewOutcome.Passed]: {
    icon: <RiCheckLine />,
    className: 'bg-green-500/15 text-green-700 dark:text-green-400',
  },
  [InterviewOutcome.Failed]: {
    icon: <RiCloseLine />,
    className: 'bg-red-500/15 text-red-700 dark:text-red-400',
  },
  [InterviewOutcome.Cancelled]: {
    icon: <RiForbidLine />,
    className: 'bg-muted text-muted-foreground',
  },
};

const InterviewOutcomeBadge = ({
  outcome,
  className,
}: {
  outcome: InterviewOutcome;
  className?: string;
}) => {
  const style = OUTCOME_STYLES[outcome];
  if (!style) return null;

  return (
    <span
      data-interview-outcome={outcome}
      className={cn(
        'inline-flex w-fit items-center gap-1 rounded-md py-0.5 pr-1.5 pl-1 text-[0.6875rem] leading-none font-semibold [&>svg]:size-3',
        style.className,
        className
      )}
    >
      {style.icon}
      {INTERVIEW_OUTCOME_LABELS[outcome]}
    </span>
  );
};

export default InterviewOutcomeBadge;
