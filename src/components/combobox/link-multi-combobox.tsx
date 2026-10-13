'use client';

import React from 'react';
import Link from 'next/link';
import { RiCheckLine } from '@remixicon/react';
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxInputProps,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from '@/components/ui/combobox.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { cn } from '@/lib/utils.ts';
import type { LinkOption } from '@/lib/link-option.ts';

interface Props {
  // The choices, each a link that adds it to the selection or takes it out
  options: LinkOption[];
  // The choice for no selection: what the box says then, and the link that clears it
  allLabel: string;
  clearHref: string;
  inputProps?: ComboboxInputProps;
}

const Checkbox = ({ checked }: { checked: boolean }) => (
  <span
    aria-hidden
    className={cn(
      'flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors',
      checked ? 'bg-primary border-primary text-primary-foreground' : 'border-input'
    )}
  >
    {checked && <RiCheckLine className={'size-3'} />}
  </span>
);

// A combobox that picks several of its options with checkboxes. Like `LinkCombobox`, each
// choice is a link, so the page holds the selection and it stays open while it changes.
const LinkMultiCombobox = ({ options, allLabel, clearHref, inputProps }: Props) => {
  const anchor = useComboboxAnchor();
  const selected = options.filter((option) => option.active);
  const all: LinkOption = { label: allLabel, href: clearHref, active: selected.length === 0 };
  const items = [all, ...options];

  const summary =
    selected.length === 0
      ? allLabel
      : selected.length === 1
        ? selected[0].label
        : `${selected.length} selected`;

  return (
    <Combobox
      multiple
      items={items}
      value={items.filter((option) => option.active)}
      itemToStringLabel={(option) => option.label}
      isItemEqualToValue={(a, b) => a.label === b.label}
    >
      <ComboboxInput {...inputProps} placeholder={summary} anchorRef={anchor} />

      <ComboboxContent anchor={anchor}>
        <ScrollArea viewportProps={{ className: 'max-h-65' }}>
          <ComboboxList className="max-h-none overflow-visible">
            {(option: LinkOption) => (
              <ComboboxItem
                key={option.label}
                value={option}
                showIndicator={false}
                render={<Link href={option.href} prefetch={false} />}
              >
                <Checkbox checked={option.active} />
                {option.icon}
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ScrollArea>
      </ComboboxContent>
    </Combobox>
  );
};

export default LinkMultiCombobox;
