'use client';

import React, { useSyncExternalStore } from 'react';
import { differenceInCalendarDays, format, isSameWeek } from 'date-fns';

const subscribe = () => () => {};

// Today and tomorrow by name, the weekday for the rest of this week, then the date itself
function describe(date: Date, now: Date) {
  const days = differenceInCalendarDays(date, now);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days > 1 && isSameWeek(date, now, { weekStartsOn: 1 })) return format(date, 'EEEE');
  return format(date, date.getFullYear() === now.getFullYear() ? 'EEE dd MMM' : 'EEE dd MMM yyyy');
}

interface Props {
  // An exact instant (ISO)
  date: string;
  className?: string;
  children?: React.ReactNode;
}

// A date that is still ahead, in the viewer's own time zone. The server doesn't know it, so it
// renders nothing where the date goes and the browser fills it in, with no mismatch to hydrate
const FutureDateTime = ({ date, className, children }: Props) => {
  const text = useSyncExternalStore(
    subscribe,
    () => describe(new Date(date), new Date()),
    () => ''
  );

  return (
    <span className={className}>
      {children}
      {text}
    </span>
  );
};

export default FutureDateTime;
