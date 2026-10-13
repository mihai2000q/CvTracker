'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
import type { SortOption } from '@/lib/sort.ts';

interface Props {
  options: SortOption[];
  inputProps?: ComboboxInputProps;
}

const SortCombobox = ({ options, inputProps }: Props) => {
  const anchor = useComboboxAnchor();
  const [open, setOpen] = useState(false);
  const active = options.find((option) => option.active) ?? null;

  return (
    <Combobox
      items={options}
      value={active}
      open={open}
      onOpenChange={setOpen}
      itemToStringLabel={(option) => option.label}
      isItemEqualToValue={(a, b) => a.label === b.label}
    >
      <ComboboxInput {...inputProps} anchorRef={anchor}>
        {active?.icon && <InputGroupAddon>{active.icon}</InputGroupAddon>}
      </ComboboxInput>

      <ComboboxContent anchor={anchor}>
        <ComboboxList>
          {(option: SortOption) => (
            <ComboboxItem
              key={option.label}
              value={option}
              render={<Link href={option.href} prefetch={false} />}
              // The link navigates, but the selection only changes once the new page renders
              onClick={() => setOpen(false)}
            >
              {option.icon}
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default SortCombobox;
