'use client';

import React, { useSyncExternalStore } from 'react';
import { format } from 'date-fns';

const subscribe = () => () => {};

interface Props {
  // An exact instant (ISO)
  date: string;
  // A date-fns format, such as 'EEE dd MMM yyyy' or 'HH:mm'
  pattern: string;
  className?: string;
}

// A date in the viewer's own time zone, whichever it was in the past or will be. The server
// doesn't know it, so it renders nothing where the date goes and the browser fills it in, with
// no mismatch to hydrate
const LocalDateTime = ({ date, pattern, className }: Props) => {
  const text = useSyncExternalStore(
    subscribe,
    () => format(new Date(date), pattern),
    () => ''
  );

  return (
    <time dateTime={date} className={className}>
      {text}
    </time>
  );
};

export default LocalDateTime;
