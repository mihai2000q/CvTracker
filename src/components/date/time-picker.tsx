'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Button } from '@/components/ui/button.tsx';

export const PERIODS = ['AM', 'PM'];
const MINUTE_STEP = 5;
const HOUR_VALUES = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTE_VALUES = Array.from({ length: 60 / MINUTE_STEP }, (_, index) => index * MINUTE_STEP);

interface Props {
  // What is picked so far, 1-12 and 0-59, undefined while it isn't
  hour: number | undefined;
  minute: number | undefined;
  period: string | undefined;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  onPeriodChange: (period: string) => void;
}

const TimePicker = ({
  hour,
  minute,
  period,
  onHourChange,
  onMinuteChange,
  onPeriodChange,
}: Props) => (
  <div
    className="flex gap-1"
    // Pressing a value shouldn't pull focus out of the input it belongs to, or its popover would close
    onMouseDown={(event) => {
      if ((event.target as HTMLElement).closest('button')) event.preventDefault();
    }}
  >
    <TimeColumn label="Hours" values={HOUR_VALUES} selected={hour} onPick={onHourChange} />
    <Separator orientation="vertical" />
    <TimeColumn label="Minutes" values={MINUTE_VALUES} selected={minute} onPick={onMinuteChange} />
    <Separator orientation="vertical" />
    <div role="group" aria-label="AM or PM" className="flex w-14 flex-col gap-0.5 pr-1.5">
      {PERIODS.map((label) => (
        <Button
          key={label}
          type="button"
          size="sm"
          variant={label === period ? 'default' : 'ghost'}
          aria-pressed={label === period}
          onClick={() => onPeriodChange(label)}
          className="w-full"
        >
          {label}
        </Button>
      ))}
    </div>
  </div>
);

interface TimeColumnProps {
  label: string;
  values: number[];
  selected: number | undefined;
  onPick: (value: number) => void;
}

const TimeColumn = ({ label, values, selected, onPick }: TimeColumnProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Keeps the selected value in the middle, both when it opens and as the field is typed in
  useLayoutEffect(() => {
    const viewport = ref.current?.querySelector<HTMLElement>('[data-slot=scroll-area-viewport]');
    const item = ref.current?.querySelector<HTMLElement>('[aria-pressed=true]');
    if (viewport && item) {
      viewport.scrollTop = item.offsetTop - viewport.clientHeight / 2 + item.offsetHeight / 2;
    }
  }, [selected]);

  return (
    <div ref={ref} role="group" aria-label={label} className="h-52 w-14">
      <ScrollArea className="h-full">
        <div className="relative flex flex-col gap-0.5 pr-1.5">
          {values.map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={value === selected ? 'default' : 'ghost'}
              aria-pressed={value === selected}
              onClick={() => onPick(value)}
              className="w-full tabular-nums"
            >
              {String(value).padStart(2, '0')}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TimePicker;
