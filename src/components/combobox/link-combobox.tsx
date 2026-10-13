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
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import type { LinkOption } from '@/lib/link-option.ts';

interface Props {
  options: LinkOption[];
  inputProps?: ComboboxInputProps;
}

const LinkCombobox = ({ options, inputProps }: Props) => {
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
        <ScrollArea viewportProps={{ className: 'max-h-65' }}>
          <ComboboxList className="max-h-none overflow-visible">
            {(option: LinkOption) => (
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
        </ScrollArea>
      </ComboboxContent>
    </Combobox>
  );
};

export default LinkCombobox;
