'use client';

import { useState } from 'react';
import { format, startOfToday } from 'date-fns';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import { Calendar } from '@/components/ui/calendar.tsx';

// A matcher, so the current date is read when the calendar renders, not at prerender
export const isFutureDate = (date: Date) => date > new Date();
// Today itself is still allowed
export const isPastDate = (date: Date) => date < startOfToday();

type View = 'days' | 'months' | 'years';

const YEARS_PER_PAGE = 12;

interface Props {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  // Which side of today can't be picked
  disable?: 'past' | 'future';
}

// The shadcn calendar with a drill-down header: the month and year open a grid of months,
// whose year opens a grid of years, and picking one goes back down to the days
const DatePicker = ({ selected, onSelect, month, onMonthChange, disable }: Props) => {
  const [view, setView] = useState<View>('days');
  const [internalMonth, setInternalMonth] = useState(() => selected ?? new Date());
  const [pageStart, setPageStart] = useState(0);

  const shownMonth = month ?? internalMonth;
  const year = shownMonth.getFullYear();
  const disableFuture = disable === 'future';
  const disablePast = disable === 'past';
  const latest = disableFuture ? new Date() : undefined;
  const earliest = disablePast ? startOfToday() : undefined;

  const showMonth = (next: Date) => {
    setInternalMonth(next);
    onMonthChange?.(next);
  };

  const isAfterLatest = (candidateYear: number, monthIndex = 0) =>
    latest !== undefined &&
    (candidateYear > latest.getFullYear() ||
      (candidateYear === latest.getFullYear() && monthIndex > latest.getMonth()));

  // The default month is the last, so a year alone is before the earliest only if it is wholly past
  const isBeforeEarliest = (candidateYear: number, monthIndex = 11) =>
    earliest !== undefined &&
    (candidateYear < earliest.getFullYear() ||
      (candidateYear === earliest.getFullYear() && monthIndex < earliest.getMonth()));

  if (view === 'days') {
    return (
      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={shownMonth}
        onMonthChange={showMonth}
        startMonth={earliest}
        endMonth={latest}
        disabled={
          disableFuture || disablePast
            ? (date) =>
                Boolean(disableFuture && isFutureDate(date)) ||
                Boolean(disablePast && isPastDate(date))
            : undefined
        }
        components={{
          CaptionLabel: ({ children }) => (
            <button
              type="button"
              onClick={() => setView('months')}
              className="hover:bg-muted relative z-10 cursor-pointer rounded-md px-2 py-1 text-sm font-medium"
            >
              {children}
            </button>
          ),
        }}
      />
    );
  }

  if (view === 'months') {
    return (
      <div className="w-62 p-3">
        <Header
          title={String(year)}
          onTitle={() => {
            setPageStart(year - (year % YEARS_PER_PAGE));
            setView('years');
          }}
          onPrevious={() => showMonth(new Date(year - 1, shownMonth.getMonth(), 1))}
          onNext={() => showMonth(new Date(year + 1, shownMonth.getMonth(), 1))}
          previousDisabled={isBeforeEarliest(year - 1)}
          nextDisabled={isAfterLatest(year + 1)}
        />
        <div className="mt-2 grid grid-cols-3 gap-1">
          {Array.from({ length: 12 }, (_, index) => (
            <Button
              key={index}
              type="button"
              variant={index === shownMonth.getMonth() ? 'default' : 'ghost'}
              disabled={isAfterLatest(year, index) || isBeforeEarliest(year, index)}
              className="h-9 font-normal"
              onClick={() => {
                showMonth(new Date(year, index, 1));
                setView('days');
              }}
            >
              {format(new Date(2000, index, 1), 'MMM')}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-62 p-3">
      <Header
        title={`${pageStart} – ${pageStart + YEARS_PER_PAGE - 1}`}
        onPrevious={() => setPageStart(pageStart - YEARS_PER_PAGE)}
        onNext={() => setPageStart(pageStart + YEARS_PER_PAGE)}
        previousDisabled={isBeforeEarliest(pageStart - 1)}
        nextDisabled={isAfterLatest(pageStart + YEARS_PER_PAGE)}
      />
      <div className="mt-2 grid grid-cols-3 gap-1">
        {Array.from({ length: YEARS_PER_PAGE }, (_, index) => pageStart + index).map(
          (candidate) => (
            <Button
              key={candidate}
              type="button"
              variant={candidate === year ? 'default' : 'ghost'}
              disabled={isAfterLatest(candidate) || isBeforeEarliest(candidate)}
              className="h-9 font-normal"
              onClick={() => {
                showMonth(new Date(candidate, shownMonth.getMonth(), 1));
                setView('months');
              }}
            >
              {candidate}
            </Button>
          )
        )}
      </div>
    </div>
  );
};

interface HeaderProps {
  title: string;
  onTitle?: () => void;
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
}

function Header({
  title,
  onTitle,
  onPrevious,
  onNext,
  previousDisabled,
  nextDisabled,
}: HeaderProps) {
  return (
    <div className="flex h-8 items-center justify-between gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Previous"
        disabled={previousDisabled}
        onClick={onPrevious}
      >
        <RiArrowLeftSLine />
      </Button>
      {onTitle ? (
        <button
          type="button"
          onClick={onTitle}
          className="hover:bg-muted cursor-pointer rounded-md px-2 py-1 text-sm font-medium"
        >
          {title}
        </button>
      ) : (
        <span className="px-2 py-1 text-sm font-medium">{title}</span>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Next"
        disabled={nextDisabled}
        onClick={onNext}
      >
        <RiArrowRightSLine />
      </Button>
    </div>
  );
}

export default DatePicker;
