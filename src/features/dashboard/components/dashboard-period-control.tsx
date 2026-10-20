'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { RiCalendarLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import { Calendar } from '@/components/ui/calendar.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { SegmentedControl } from '@/components/ui/segmented-control.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { useIsMobile } from '@/hooks/use-mobile.ts';
import { useSearchParamsState } from '@/hooks/use-search-params-state.ts';
import { cn } from '@/lib/utils.ts';
import { dashboardSearchParamsState } from '@/features/dashboard/schemas/dashboard-search-params.ts';
import {
  DASHBOARD_RANGE_LABELS,
  DASHBOARD_RANGE_QUICK_PICKS,
  DASHBOARD_RANGE_SEGMENTS,
} from '@/features/dashboard/constants/dashboard-filtering.ts';
import type { DashboardRange } from '@/features/dashboard/types/dashboard-filtering.ts';

const DAY_FORMAT = 'yyyy-MM-dd';

// The days of a custom range, with the year only where it isn't the current one
const describeDays = (from: string, to: string) => {
  const start = parseISO(from);
  const end = parseISO(to);
  const thisYear = new Date().getFullYear();
  const pattern =
    start.getFullYear() === thisYear && end.getFullYear() === thisYear ? 'd MMM' : 'd MMM yyyy';

  return from === to
    ? format(start, pattern)
    : `${format(start, pattern)} – ${format(end, pattern)}`;
};

// The period of the whole dashboard: the ranges that are always in sight, and a popover with the
// other ones and a calendar for any two days
const DashboardPeriodControl = () => {
  const { values, hrefFor, set } = useSearchParamsState(dashboardSearchParamsState);
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();

  const hrefForRange = (range: DashboardRange) =>
    hrefFor({ range, from: undefined, to: undefined });

  const segments = DASHBOARD_RANGE_SEGMENTS.map((range) => ({
    label: DASHBOARD_RANGE_LABELS[range],
    href: hrefForRange(range),
    active: values.range === range,
  }));

  // One of the others, or a custom range, is what the button of the popover says
  const isElsewhere = !(DASHBOARD_RANGE_SEGMENTS as readonly DashboardRange[]).includes(
    values.range
  );
  const buttonLabel =
    values.range === 'custom' && values.from && values.to
      ? describeDays(values.from, values.to)
      : values.range !== 'custom' && isElsewhere
        ? DASHBOARD_RANGE_LABELS[values.range]
        : 'Custom period';

  const handleOpenChange = (nextOpen: boolean) => {
    // The calendar starts out with the custom range that is set, if one is
    if (nextOpen) {
      setDraft(
        values.from && values.to
          ? { from: parseISO(values.from), to: parseISO(values.to) }
          : undefined
      );
    }
    setOpen(nextOpen);
  };

  const apply = () => {
    if (!draft?.from) return;
    set(
      {
        range: 'custom',
        from: format(draft.from, DAY_FORMAT),
        to: format(draft.to ?? draft.from, DAY_FORMAT),
      },
      { history: 'push' }
    );
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 max-md:justify-center">
      <SegmentedControl items={segments} variant="chart" aria-label="Period" />

      <Popover open={open} onOpenChange={handleOpenChange}>
        <Tooltip>
          <TooltipTrigger
            render={
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={buttonLabel}
                    className={cn(
                      'rounded-full',
                      isElsewhere &&
                        'border-transparent bg-(--chart-2) text-white hover:bg-(--chart-2)/85 hover:text-white dark:bg-(--chart-2) dark:hover:bg-(--chart-2)/85'
                    )}
                  />
                }
              />
            }
          >
            <RiCalendarLine />
          </TooltipTrigger>
          <TooltipContent>{buttonLabel}</TooltipContent>
        </Tooltip>
        <PopoverContent align="end" className="w-auto flex-col gap-0 p-0 sm:flex-row">
          <nav
            aria-label="Periods"
            className="flex flex-col gap-0.5 border-b p-2 sm:border-r sm:border-b-0"
          >
            {DASHBOARD_RANGE_QUICK_PICKS.map((range) => (
              <Link
                key={range}
                href={hrefForRange(range)}
                prefetch={false}
                onClick={() => setOpen(false)}
                aria-current={values.range === range ? 'page' : undefined}
                className={cn(
                  'hover:bg-accent focus-visible:ring-ring/50 rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap outline-none focus-visible:ring-3',
                  values.range === range && 'bg-accent font-medium'
                )}
              >
                {DASHBOARD_RANGE_LABELS[range]}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col">
            <Calendar
              mode="range"
              numberOfMonths={isMobile ? 1 : 2}
              selected={draft}
              onSelect={setDraft}
              defaultMonth={draft?.from}
              // The period is about applications that are done, so there are none in the future
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
              <Button size="sm" disabled={!draft?.from} onClick={apply}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DashboardPeriodControl;
