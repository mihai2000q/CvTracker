'use client';

import React, { useState } from 'react';
import { RiBriefcaseLine } from '@remixicon/react';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from '@/components/ui/combobox.tsx';
import { InputGroupAddon } from '@/components/ui/input-group.tsx';
import { CONTACT_ROLES } from '@/features/organizations/constants/contact-roles.ts';

interface Props {
  change: (role: string) => void;
  blur?: () => void;
  id?: string;
  invalid?: boolean;
}

const ContactRoleCombobox = ({ change, blur, id, invalid }: Props) => {
  const anchor = useComboboxAnchor();
  const [selected, setSelected] = useState<string | null>(null);
  const [role, setRole] = useState('');

  const handleValueChange = (next: string | null) => {
    if (!next) return;
    setRole(next);
    setSelected(next);
    change(next);
  };

  // Only a real keystroke gets here, not the automatic clear when the box loses focus
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRole(event.target.value);
    setSelected(null);
    change(event.target.value.trim());
  };

  return (
    <Combobox
      items={CONTACT_ROLES}
      value={selected}
      onValueChange={handleValueChange}
      inputValue={role}
    >
      <ComboboxInput
        anchorRef={anchor}
        id={id}
        aria-invalid={invalid || undefined}
        placeholder={'e.g. Recruiter'}
        maxLength={100}
        onChange={handleInputChange}
        onBlur={blur}
      >
        <InputGroupAddon>
          <RiBriefcaseLine />
        </InputGroupAddon>
      </ComboboxInput>

      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No role found</ComboboxEmpty>
        <ComboboxList>
          {(suggestion: string) => (
            <ComboboxItem key={suggestion} value={suggestion}>
              {suggestion}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default ContactRoleCombobox;
