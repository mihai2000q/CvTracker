'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import { Popover, PopoverContent } from '@/components/ui/popover.tsx';
import { RiArrowDownSLine, RiTimeLine } from '@remixicon/react';
import TimePicker, { PERIODS } from '@/components/date/time-picker.tsx';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group.tsx';

const TEMPLATE = 'hh:mm aa';
const EMPTY_PERIOD = 'aa';
// Index of every segment the user can replace: the colon and the space are fixed
const DIGIT_POSITIONS = [0, 1, 3, 4];
const MINUTES_POSITION = 3;
const PERIOD_POSITION = 6;
const LAST_POSITION = PERIOD_POSITION;

interface Props {
  // Gets the time as HH:mm (24h), '' while empty, or the text typed so far while it's unfinished
  change: (value: string) => void;
  blur?: () => void;
  id?: string;
  invalid?: boolean;
  // The time it starts with, as HH:mm (24h)
  defaultValue?: string;
}

const TimeInput = ({ change, blur, id, invalid, defaultValue }: Props) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(defaultValue ? toDisplay(defaultValue) : TEMPLATE);
  const [position, setPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Replacing the controlled value moves the caret to the end, so select the active segment again
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement === input) {
      input.setSelectionRange(position, position + segmentLength(position));
    }
  }, [text, position]);

  const commit = (nextText: string, nextPosition: number) => {
    setText(nextText);
    setPosition(nextPosition);
    // A partly typed time is passed on as it is, so it reads as invalid and only an empty field as required
    change(toValue(nextText) ?? (nextText === TEMPLATE ? '' : nextText));
  };

  const select = (nextPosition: number) => {
    setPosition(nextPosition);
    inputRef.current?.setSelectionRange(nextPosition, nextPosition + segmentLength(nextPosition));
  };

  const clearAt = (index: number) =>
    index === PERIOD_POSITION
      ? text.slice(0, PERIOD_POSITION) + EMPTY_PERIOD
      : replaceAt(text, index, TEMPLATE[index]);

  // Steps the segment the caret is in (hours, minutes or AM/PM) and wraps around
  const step = (delta: number) => {
    if (position >= PERIOD_POSITION) {
      const period = text.slice(PERIOD_POSITION);
      const next = period === 'AM' ? 'PM' : period === 'PM' ? 'AM' : delta > 0 ? 'AM' : 'PM';
      commit(text.slice(0, PERIOD_POSITION) + next, PERIOD_POSITION);
      return;
    }
    const isHour = position <= 1;
    const start = isHour ? 0 : MINUTES_POSITION;
    const typed = numberAt(text, start);
    const next = isHour
      ? typed === undefined
        ? delta > 0
          ? 1
          : 12
        : ((typed - 1 + delta + 12) % 12) + 1
      : typed === undefined
        ? delta > 0
          ? 0
          : 59
        : (typed + delta + 60) % 60;
    const padded = String(next).padStart(2, '0');
    commit(replaceAt(replaceAt(text, start, padded[0]), start + 1, padded[1]), start);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.key === 'Tab') return;

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      const typed = typeDigit(text, position, event.key);
      if (typed) commit(typed.text, typed.position);
      return;
    }

    if (/^[ap]$/i.test(event.key)) {
      event.preventDefault();
      commit(
        text.slice(0, PERIOD_POSITION) + (event.key.toLowerCase() === 'a' ? 'AM' : 'PM'),
        PERIOD_POSITION
      );
      return;
    }

    switch (event.key) {
      case 'Backspace': {
        event.preventDefault();
        // The last segment stays selected after it's typed, so clear that one instead of the one before
        const target =
          position === LAST_POSITION && text.slice(position) !== EMPTY_PERIOD
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
      case 'ArrowUp':
        event.preventDefault();
        step(1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        step(-1);
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
        // Other characters don't belong in a time
        if (event.key.length === 1) event.preventDefault();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text');
    let nextText = text;
    let nextPosition = position;
    for (const digit of pasted.replace(/\D/g, '')) {
      const typed = typeDigit(nextText, nextPosition, digit);
      if (!typed) break;
      nextText = typed.text;
      nextPosition = typed.position;
    }
    const period = /([ap])\.?m?\.?\s*$/i.exec(pasted)?.[1];
    if (period) {
      nextText = nextText.slice(0, PERIOD_POSITION) + (period.toLowerCase() === 'a' ? 'AM' : 'PM');
      nextPosition = PERIOD_POSITION;
    }
    commit(nextText, nextPosition);
  };

  const pickHour = (hour: number) => {
    const padded = String(hour).padStart(2, '0');
    commit(replaceAt(replaceAt(text, 0, padded[0]), 1, padded[1]), MINUTES_POSITION);
  };

  const pickMinute = (minute: number) => {
    const padded = String(minute).padStart(2, '0');
    const nextText = replaceAt(replaceAt(text, 3, padded[0]), 4, padded[1]);
    commit(nextText, PERIOD_POSITION);
    if (toValue(nextText)) setOpen(false);
  };

  const pickPeriod = (period: string) => {
    const nextText = text.slice(0, PERIOD_POSITION) + period;
    commit(nextText, PERIOD_POSITION);
    if (toValue(nextText)) setOpen(false);
  };

  // On press, not click: a label click focuses the input with a click event but no press,
  // so it selects the field without opening the picker
  const handleContainerMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const pressedInput = event.target === inputRef.current;
    if (!pressedInput) {
      event.preventDefault();
      inputRef.current?.focus();
    }
    setOpen((previous) => (pressedInput ? true : !previous));
  };

  const period = text.slice(PERIOD_POSITION);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen, details) => {
        // Clicking or tabbing within the field shouldn't close the picker it just opened
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
          className="data-[empty=true]:text-muted-foreground selection:bg-primary/30 selection:text-foreground w-[9ch] pr-1.5 pl-1.5 tabular-nums caret-transparent"
        />
        <RiArrowDownSLine
          aria-hidden
          className="text-muted-foreground order-last mr-1 size-4 shrink-0 cursor-pointer"
        />
        <RiTimeLine
          aria-hidden
          className="text-muted-foreground order-first ml-2 size-4 shrink-0 cursor-default"
        />
      </InputGroup>
      <PopoverContent
        anchor={containerRef}
        align="start"
        initialFocus={false}
        finalFocus={false}
        className="w-auto p-1"
      >
        <TimePicker
          hour={numberAt(text, 0)}
          minute={numberAt(text, MINUTES_POSITION)}
          period={period}
          onHourChange={pickHour}
          onMinuteChange={pickMinute}
          onPeriodChange={pickPeriod}
        />
      </PopoverContent>
    </Popover>
  );
};

const nextPosition = (position: number) =>
  [...DIGIT_POSITIONS, PERIOD_POSITION].find((candidate) => candidate > position) ?? LAST_POSITION;
const previousPosition = (position: number) =>
  [...DIGIT_POSITIONS].reverse().find((candidate) => candidate < position) ?? 0;

// The AM/PM segment is two characters wide, the others one
const segmentLength = (position: number) => (position === PERIOD_POSITION ? 2 : 1);

// A click selects the first character of the segment it landed in (hh, mm or AM/PM)
const segmentStart = (caret: number) =>
  caret <= 2 ? 0 : caret <= 5 ? MINUTES_POSITION : PERIOD_POSITION;

const replaceAt = (text: string, index: number, char: string) =>
  text.slice(0, index) + char + text.slice(index + 1);

// The hours or minutes typed so far, or undefined while the segment isn't finished
const numberAt = (text: string, start: number) => {
  const typed = text.slice(start, start + 2);
  return /^\d{2}$/.test(typed) ? Number(typed) : undefined;
};

// HH:mm (24h) once the whole time is typed, otherwise undefined
function toValue(text: string) {
  const hours = numberAt(text, 0);
  const minutes = numberAt(text, MINUTES_POSITION);
  const period = text.slice(PERIOD_POSITION);
  if (hours === undefined || minutes === undefined || !PERIODS.includes(period)) return undefined;
  if (hours < 1 || hours > 12 || minutes > 59) return undefined;
  const hours24 = (hours % 12) + (period === 'PM' ? 12 : 0);
  return `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// The reverse: HH:mm (24h) as the text the field shows
function toDisplay(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return TEMPLATE;
  const hours = Number(match[1]);
  const hours12 = String(hours % 12 || 12).padStart(2, '0');
  return `${hours12}:${match[2]} ${hours >= 12 ? 'PM' : 'AM'}`;
}

// Writes the digit at the position and returns where the selection goes next, or null
// when the digit can't be part of a time. A first digit that can only be a single-digit
// hour (2-9) or minute (6-9) pads the zero and moves on, since there's nothing left to type.
function typeDigit(text: string, position: number, digit: string) {
  const value = Number(digit);
  if (position >= PERIOD_POSITION) return null;
  if (position === 0 && value > 1)
    return { text: replaceAt(replaceAt(text, 0, '0'), 1, digit), position: MINUTES_POSITION };
  if (position === 3 && value > 5)
    return { text: replaceAt(replaceAt(text, 3, '0'), 4, digit), position: PERIOD_POSITION };
  if (position === 1 && text[0] === '1' && value > 2) return null;
  if (position === 1 && text[0] === '0' && value === 0) return null;
  return { text: replaceAt(text, position, digit), position: nextPosition(position) };
}

export default TimeInput;
