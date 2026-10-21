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
import { InputGroupAddon } from '@/components/ui/input-group.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { cn } from '@/lib/utils.ts';
import type { LinkOption } from '@/lib/link-option.ts';

interface Props {
  // The choices, each a link that adds it to the selection or takes it out
  options: LinkOption[];
  // The choice for no selection: what the box says then, and the link that clears it
  allLabel: string;
  clearHref: string;
  // Beside the box; a single selection's own icon takes its place
  icon?: React.ReactNode;
  // For the dropdown, which is as wide as the box unless it says otherwise
  contentClassName?: string;
  // Where the dropdown sits against the box when the two differ in width
  contentAlign?: 'start' | 'center' | 'end';
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
const LinkMultiCombobox = ({
  options,
  allLabel,
  clearHref,
  icon,
  contentClassName,
  contentAlign,
  inputProps,
}: Props) => {
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
      isItemEqualToValue={(a, b) => a.href === b.href}
    >
      <ComboboxInput {...inputProps} placeholder={summary} anchorRef={anchor}>
        {(selected.length === 1 && selected[0].icon) || icon ? (
          <InputGroupAddon>{(selected.length === 1 && selected[0].icon) || icon}</InputGroupAddon>
        ) : null}
      </ComboboxInput>

      <ComboboxContent anchor={anchor} align={contentAlign} className={contentClassName}>
        <ScrollArea viewportProps={{ className: 'max-h-65' }}>
          <ComboboxList className="max-h-none overflow-visible">
            {(option: LinkOption) => (
              <ComboboxItem
                key={option.href}
                value={option}
                showIndicator={false}
                render={<Link href={option.href} prefetch={false} />}
              >
                <Checkbox checked={option.active} />
                {option.icon}
                <span title={option.label} className={'min-w-0 truncate'}>
                  {option.label}
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ScrollArea>
      </ComboboxContent>
    </Combobox>
  );
};

export default LinkMultiCombobox;
