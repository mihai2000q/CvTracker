'use client';

import React, { useRef, useState } from 'react';
import { endOfYear, format, parseISO, startOfYear, subDays, subMonths } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { RiArrowDownSLine, RiCalendarLine, RiCloseLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import { Calendar } from '@/components/ui/calendar.tsx';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group.tsx';
import { Popover, PopoverContent } from '@/components/ui/popover.tsx';
import { useIsMobile } from '@/hooks/use-mobile.ts';
import { cn } from '@/lib/utils.ts';

const DAY_FORMAT = 'yyyy-MM-dd';

const PRESETS: { label: string; range: () => DateRange }[] = [
  { label: 'Last 30 days', range: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'Last 3 months', range: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
  { label: 'This year', range: () => ({ from: startOfYear(new Date()), to: new Date() }) },
  {
    label: 'Last year',
    range: () => {
      const lastYear = subMonths(new Date(), 12);
      return { from: startOfYear(lastYear), to: endOfYear(lastYear) };
    },
  },
];

// The days of a range, either end of which can be open, with the year only where it isn't the
// current one
const describeDays = (from?: string, to?: string) => {
  const thisYear = new Date().getFullYear();
  const pattern = [from, to].every((day) => !day || parseISO(day).getFullYear() === thisYear)
    ? 'd MMM'
    : 'd MMM yyyy';
  const show = (day: string) => format(parseISO(day), pattern);

  if (from && to) return from === to ? show(from) : `${show(from)} – ${show(to)}`;
  if (from) return `From ${show(from)}`;
  if (to) return `Until ${show(to)}`;
  return '';
};

interface Props {
  // The range it shows, each end as yyyy-MM-dd and either of them open
  from?: string;
  to?: string;
  // The range that was picked, or undefined once it is cleared
  onChange: (range: { from: string; to: string } | undefined) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

// Looks like `DateInput`, but picks two days: it is a field that opens a popover with a few
// ranges and a calendar for any two days, not one that is typed in
const DateRangeInput = ({ from, to, onChange, placeholder = 'Any day', id, className }: Props) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);
  const isSet = Boolean(from || to);

  const pick = (range: DateRange | undefined) => {
    onChange(
      range?.from
        ? {
            from: format(range.from, DAY_FORMAT),
            to: format(range.to ?? range.from, DAY_FORMAT),
          }
        : undefined
    );
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    // The calendar starts out with the range that is set, if there is one
    if (nextOpen) {
      setDraft(from ? { from: parseISO(from), to: to ? parseISO(to) : undefined } : undefined);
    }
    setOpen(nextOpen);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      handleOpenChange(true);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen, details) => {
        // A press on the field itself is for the field to handle, or it would close and reopen
        if (!nextOpen && details.reason === 'outside-press') {
          if (containerRef.current?.contains((details.event as Event).target as Node)) return;
        }
        handleOpenChange(nextOpen);
      }}
    >
      <InputGroup
        ref={containerRef}
        onMouseDown={(event) => {
          event.preventDefault();
          event.currentTarget.querySelector('input')?.focus();
          handleOpenChange(!open);
        }}
        className={cn('cursor-pointer', className)}
      >
        <InputGroupInput
          id={id}
          readOnly
          value={describeDays(from, to)}
          placeholder={placeholder}
          autoComplete="off"
          onKeyDown={handleKeyDown}
          className="cursor-pointer pr-1.5 pl-1.5 caret-transparent"
        />
        <RiCalendarLine
          aria-hidden
          className="text-muted-foreground order-first ml-2 size-4 shrink-0"
        />
        {isSet ? (
          <button
            type="button"
            aria-label="Clear the days"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => onChange(undefined)}
            className="text-muted-foreground hover:text-foreground order-last mr-2 shrink-0 cursor-pointer rounded-sm outline-none"
          >
            <RiCloseLine aria-hidden className="size-4" />
          </button>
        ) : (
          <RiArrowDownSLine
            aria-hidden
            className="text-muted-foreground order-last mr-1 size-4 shrink-0"
          />
        )}
      </InputGroup>

      <PopoverContent
        anchor={containerRef}
        align="start"
        initialFocus={false}
        finalFocus={false}
        className="w-auto flex-col gap-0 p-0 sm:flex-row"
      >
        <nav
          aria-label="Ranges"
          className="flex flex-col gap-0.5 border-b p-2 sm:border-r sm:border-b-0"
        >
          {PRESETS.map(({ label, range }) => (
            <button
              key={label}
              type="button"
              onClick={() => pick(range())}
              className="hover:bg-accent focus-visible:ring-ring/50 cursor-pointer rounded-md px-2.5 py-1.5 text-left text-sm whitespace-nowrap outline-none focus-visible:ring-3"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex flex-col">
          <Calendar
            mode="range"
            numberOfMonths={isMobile ? 1 : 2}
            selected={draft}
            onSelect={setDraft}
            defaultMonth={draft?.from}
            disabled={{ after: new Date() }}
          />
          <div className="flex items-center justify-between gap-2 border-t p-2">
            <span className="text-muted-foreground px-1 text-xs">
              {draft?.from
                ? describeDays(
                    format(draft.from, DAY_FORMAT),
                    format(draft.to ?? draft.from, DAY_FORMAT)
                  )
                : 'Pick the first and the last day'}
            </span>
            <Button size="sm" disabled={!draft?.from} onClick={() => pick(draft)}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeInput;
