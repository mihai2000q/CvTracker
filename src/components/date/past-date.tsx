import React from 'react';
import { differenceInCalendarDays, format, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';

interface Props {
  date: string;
  className?: string;
}

const PastDate = ({ date, className }: Props) => {
  // parseISO reads a plain date as local, where new Date() would read it as midnight UTC and
  // show the day before west of Greenwich
  const parsed = parseISO(date);
  const days = differenceInCalendarDays(new Date(), parsed);
  const relative =
    days === 0
      ? 'Today'
      : days === 1
        ? 'Yesterday'
        : formatDistanceToNowStrict(parsed, { addSuffix: true });

  return (
    <Tooltip>
      <TooltipTrigger render={<span className={className} />}>{relative}</TooltipTrigger>
      <TooltipContent>{format(parsed, 'dd MMMM, yyyy')}</TooltipContent>
    </Tooltip>
  );
};

export default PastDate;
