'use client';

import React, { useState } from 'react';
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

interface Option {
  label: string;
  icon?: React.ReactNode;
}

interface Props<Item extends Option> {
  options: Item[];
  value: Item;
  onValueChange: (option: Item) => void;
  // For the dropdown, which is as wide as the box unless it says otherwise
  contentClassName?: string;
  inputProps?: ComboboxInputProps;
}

const OptionCombobox = <Item extends Option>({
  options,
  value,
  onValueChange,
  inputProps,
  contentClassName,
}: Props<Item>) => {
  const anchor = useComboboxAnchor();
  const [open, setOpen] = useState(false);

  return (
    <Combobox
      items={options}
      value={value}
      open={open}
      onOpenChange={setOpen}
      onValueChange={(next) => next && onValueChange(next)}
      itemToStringLabel={(option) => option.label}
      isItemEqualToValue={(a, b) => a.label === b.label}
    >
      <ComboboxInput {...inputProps} anchorRef={anchor}>
        {value.icon && <InputGroupAddon>{value.icon}</InputGroupAddon>}
      </ComboboxInput>

      <ComboboxContent anchor={anchor} className={contentClassName}>
        <ScrollArea viewportProps={{ className: 'max-h-65' }}>
          <ComboboxList className="max-h-none overflow-visible">
            {(option: Item) => (
              <ComboboxItem key={option.label} value={option}>
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

export default OptionCombobox;
