'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RiUserLine } from '@remixicon/react';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox.tsx';
import { InputGroupAddon } from '@/components/ui/input-group.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { fetchJson } from '@/lib/http/fetch-json.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import { ContactSummary } from '@/features/organizations/types/contact.ts';

interface Props {
  organizationId: string;
  change: (ids: string[]) => void;
  blur?: () => void;
}

const ContactCombobox = ({ organizationId, change, blur }: Props) => {
  const [selected, setSelected] = useState<ContactSummary[]>([]);
  const anchor = useComboboxAnchor();

  const { data: contacts, isPending } = useQuery({
    queryKey: queryKeys.organizationContacts(organizationId),
    queryFn: () => fetchJson<ContactSummary[]>(`/api/organizations/${organizationId}/contacts`),
  });

  const hasNoContacts = !isPending && contacts?.length === 0;
  const isDisabled = isPending || hasNoContacts;

  const handleValueChange = (next: ContactSummary[]) => {
    setSelected(next);
    change(next.map((contact) => contact.id));
  };

  return (
    <Combobox
      multiple
      autoHighlight
      items={contacts ?? []}
      value={selected}
      onValueChange={handleValueChange}
      itemToStringLabel={(contact: ContactSummary) => contact.name}
      isItemEqualToValue={(a: ContactSummary, b: ContactSummary) => a.id === b.id}
      disabled={isDisabled}
    >
      <ComboboxChips ref={anchor} data-disabled={isDisabled}>
        <InputGroupAddon className={'p-0'}>
          {isPending ? <Spinner /> : <RiUserLine />}
        </InputGroupAddon>
        <ComboboxValue>
          {(values: ContactSummary[]) => (
            <React.Fragment>
              {values.map((contact) => (
                <ComboboxChip key={contact.id}>{contact.name}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={
                  hasNoContacts
                    ? 'No contacts yet'
                    : values.length === 0
                      ? 'Select contacts...'
                      : undefined
                }
                onBlur={blur}
                disabled={isDisabled}
              />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>

      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No contacts found</ComboboxEmpty>
        <ComboboxList>
          {(contact: ContactSummary) => (
            <ComboboxItem key={contact.id} value={contact}>
              {contact.name}
              {contact.role && (
                <span className={'text-muted-foreground text-xs'}>{contact.role}</span>
              )}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default ContactCombobox;
