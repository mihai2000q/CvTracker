'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import { Popover, PopoverContent } from '@/components/ui/popover.tsx';
import { format, isValid, parse, parseISO } from 'date-fns';
import { RiArrowDownSLine, RiCalendarLine } from '@remixicon/react';
import DatePicker, { isFutureDate, isPastDate } from '@/components/date/date-picker.tsx';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group.tsx';

const TEMPLATE = 'DD/MM/YYYY';
// Only fills in fields the format doesn't have, and ours has them all, so any fixed date works
const REFERENCE_DATE = new Date(0);
const DISPLAY_FORMAT = 'dd/MM/yyyy';
// Index of every character the user can replace: the slashes are fixed
const DIGIT_POSITIONS = [0, 1, 3, 4, 6, 7, 8, 9];
const LAST_POSITION = 9;

interface Props {
  change: (value: string) => void;
  blur?: () => void;
  id?: string;
  invalid?: boolean;
  // The date it starts with, as yyyy-MM-dd
  defaultValue?: string;
  // Which side of today can't be picked: a date there is replaced by today
  disable?: 'past' | 'future';
}

const DateInput = ({ change, blur, id, invalid, disable, defaultValue }: Props) => {
  const initialDate = defaultValue ? parseISO(defaultValue) : undefined;
  const disableFuture = disable === 'future';
  const disablePast = disable === 'past';
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(initialDate ? format(initialDate, DISPLAY_FORMAT) : TEMPLATE);
  const [position, setPosition] = useState(0);
  // What the calendar shows for whatever is typed so far
  const [viewMonth, setViewMonth] = useState<Date | undefined>(initialDate);
  const [preview, setPreview] = useState<Date | undefined>(initialDate);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Replacing the controlled value moves the caret to the end, so select the active character again
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement === input) input.setSelectionRange(position, position + 1);
  }, [text, position]);

  // Read when typing, never while rendering
  const getYearRange = () => ({
    min: disablePast ? new Date().getFullYear() : undefined,
    max: disableFuture ? new Date().getFullYear() : undefined,
  });

  const commit = (typedText: string, nextPosition: number) => {
    const nextText = normalize(typedText, disableFuture, disablePast);
    setText(nextText);
    setPosition(nextPosition);
    const calendar = previewFor(nextText, viewMonth ?? new Date());
    setViewMonth(calendar.view);
    setPreview(calendar.preview);
    const date = toDate(nextText);
    const isAllowed =
      date && !(disableFuture && isFutureDate(date)) && !(disablePast && isPastDate(date));
    // A partly typed or disallowed date is passed on as it is, so it reads as invalid and only an empty field as required
    change(isAllowed ? format(date, 'yyyy-MM-dd') : nextText === TEMPLATE ? '' : nextText);
  };

  const select = (nextPosition: number) => {
    setPosition(nextPosition);
    inputRef.current?.setSelectionRange(nextPosition, nextPosition + 1);
  };

  const clearAt = (index: number) => replaceAt(text, index, TEMPLATE[index]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.key === 'Tab') return;

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      const typed = typeDigit(text, position, event.key, getYearRange());
      if (typed) commit(typed.text, typed.position);
      return;
    }

    switch (event.key) {
      case 'Backspace': {
        event.preventDefault();
        // The last digit stays selected after it's typed, so clear that one instead of the one before
        const target =
          position === LAST_POSITION && text[position] !== TEMPLATE[position]
            ? position
            : previousPosition(position);
        commit(clearAt(target), target);
        break;
      }
      case 'Delete':
        event.preventDefault();
        commit(clearAt(position), position);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        select(previousPosition(position));
        break;
      case 'ArrowRight':
        event.preventDefault();
        select(nextPosition(position));
        break;
      case 'Home':
        event.preventDefault();
        select(0);
        break;
      case 'End':
        event.preventDefault();
        select(LAST_POSITION);
        break;
      default:
        // Letters and other characters don't belong in a date
        if (event.key.length === 1) event.preventDefault();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    let nextText = text;
    let nextPosition = position;
    for (const digit of event.clipboardData.getData('text').replace(/\D/g, '')) {
      const typed = typeDigit(nextText, nextPosition, digit, getYearRange());
      if (!typed) break;
      nextText = typed.text;
      nextPosition = typed.position;
    }
    commit(nextText, nextPosition);
  };

  const handleSelect = (date: Date | undefined) => {
    commit(date ? format(date, DISPLAY_FORMAT) : TEMPLATE, position);
    setOpen(false);
  };

  // On press, not click: a label click focuses the input with a click event but no press,
  // so it selects the field without opening the calendar
  const handleContainerMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const pressedInput = event.target === inputRef.current;
    if (!pressedInput) {
      event.preventDefault();
      inputRef.current?.focus();
    }
    setOpen((previous) => (pressedInput ? true : !previous));
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen, details) => {
        // Clicking or tabbing within the field shouldn't close the calendar it just opened
        if (!nextOpen && (details.reason === 'outside-press' || details.reason === 'focus-out')) {
          const { target, relatedTarget } = details.event as FocusEvent;
          const container = containerRef.current;
          if (container?.contains(target as Node) || container?.contains(relatedTarget as Node)) {
            return;
          }
        }
        setOpen(nextOpen);
      }}
    >
      <InputGroup
        ref={containerRef}
        onMouseDown={handleContainerMouseDown}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) blur?.();
        }}
        className="w-auto cursor-text"
      >
        <InputGroupInput
          ref={inputRef}
          id={id}
          value={text}
          aria-invalid={invalid || undefined}
          data-empty={text === TEMPLATE}
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          onChange={() => {}}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCut={(event) => event.preventDefault()}
          onFocus={() => setPosition(0)}
          onClick={(event) => select(segmentStart(event.currentTarget.selectionStart ?? 0))}
          className="data-[empty=true]:text-muted-foreground selection:bg-primary/30 selection:text-foreground pr-1.5 pl-1.5 tabular-nums caret-transparent"
        />
        <RiArrowDownSLine
          aria-hidden
          className="text-muted-foreground order-last mr-1 size-4 shrink-0 cursor-pointer"
        />
        <RiCalendarLine
          aria-hidden
          className="text-muted-foreground order-first ml-2 size-4 shrink-0 cursor-default"
        />
      </InputGroup>
      <PopoverContent
        anchor={containerRef}
        align="start"
        initialFocus={false}
        finalFocus={false}
        className="w-auto p-0"
      >
        <DatePicker
          selected={preview}
          onSelect={handleSelect}
          month={viewMonth}
          onMonthChange={setViewMonth}
          disable={disable}
        />
      </PopoverContent>
    </Popover>
  );
};

const nextPosition = (position: number) =>
  DIGIT_POSITIONS.find((candidate) => candidate > position) ?? LAST_POSITION;
const previousPosition = (position: number) =>
  [...DIGIT_POSITIONS].reverse().find((candidate) => candidate < position) ?? 0;

// A click selects the first character of the segment it landed in (DD, MM or YYYY)
const segmentStart = (caret: number) => (caret <= 2 ? 0 : caret <= 5 ? 3 : 6);

const replaceAt = (text: string, index: number, char: string) =>
  text.slice(0, index) + char + text.slice(index + 1);

function dateOf(year: number, monthIndex: number, day: number) {
  // setFullYear, because the Date constructor reads years 0-99 as 1900-1999
  const date = new Date(2000, 0, 1);
  date.setFullYear(year, monthIndex, day);
  return date;
}

// Missing parts fall back to the month the calendar is already showing, so a day typed
// on its own is highlighted there, and typing the month and then the year moves it along
function previewFor(text: string, base: Date) {
  const isNumber = (part: string, length: number) => part.length === length && /^\d+$/.test(part);
  const day = isNumber(text.slice(0, 2), 2) ? Number(text.slice(0, 2)) : 0;
  const month = isNumber(text.slice(3, 5), 2) ? Number(text.slice(3, 5)) : 0;
  const year = isNumber(text.slice(6), 4) ? Number(text.slice(6)) : base.getFullYear();

  const view = dateOf(year, month ? month - 1 : base.getMonth(), 1);
  const date = day ? dateOf(year, view.getMonth(), day) : undefined;
  // A day the month doesn't have (31 in a 30-day month) rolls over, so it isn't previewed
  return { view, preview: date?.getMonth() === view.getMonth() ? date : undefined };
}

function toDate(text: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(text)) return undefined;
  const date = parse(text, DISPLAY_FORMAT, REFERENCE_DATE);
  return isValid(date) ? date : undefined;
}

// Once a full date is typed, a day the month doesn't have becomes its last day, and with
// disableFuture a date after today becomes today (disablePast one before it), so a finished
// date is never invalid
function normalize(text: string, disableFuture?: boolean, disablePast?: boolean) {
  const day = text.slice(0, 2);
  const month = text.slice(3, 5);
  const year = text.slice(6);
  if (!/^\d{2}$/.test(month) || !/^\d{4}$/.test(year) || Number(month) < 1) return text;

  let result = text;
  const lastDay = dateOf(Number(year), Number(month), 0).getDate();
  if (/^\d{2}$/.test(day) && Number(day) > lastDay) {
    result = `${String(lastDay).padStart(2, '0')}${text.slice(2)}`;
  }

  if (disableFuture) {
    const date = toDate(result);
    const now = new Date();
    if (date && date > now) result = format(now, DISPLAY_FORMAT);
  }
  if (disablePast) {
    const date = toDate(result);
    if (date && isPastDate(date)) result = format(new Date(), DISPLAY_FORMAT);
  }
  return result;
}

// Writes the digit at the position and returns where the selection goes next, or null
// when the digit can't be part of a date. A first digit that can only be a single-digit
// day (4-9) or month (2-9) pads the zero and moves on, since there's nothing left to type.
function typeDigit(
  text: string,
  position: number,
  typedDigit: string,
  years: { min?: number; max?: number } = {}
) {
  let digit = typedDigit;
  // Once the year typed so far matches the latest (or earliest) allowed one, a digit can't go
  // past (or under) that year's
  if (position >= 6) {
    const offset = position - 6;
    const typedYear = text.slice(6, position);
    if (years.max !== undefined) {
      const latest = String(years.max);
      if (typedYear === latest.slice(0, offset) && digit > latest[offset]) digit = latest[offset];
    }
    if (years.min !== undefined) {
      const earliest = String(years.min);
      if (typedYear === earliest.slice(0, offset) && digit < earliest[offset]) {
        digit = earliest[offset];
      }
    }
  }
  const value = Number(digit);
  if (position === 0 && value > 3)
    return { text: replaceAt(replaceAt(text, 0, '0'), 1, digit), position: 3 };
  if (position === 3 && value > 1)
    return { text: replaceAt(replaceAt(text, 3, '0'), 4, digit), position: 6 };
  if (position === 1 && text[0] === '3' && value > 1) return null;
  if (position === 4 && text[3] === '1' && value > 2) return null;
  return { text: replaceAt(text, position, digit), position: nextPosition(position) };
}

export default DateInput;
