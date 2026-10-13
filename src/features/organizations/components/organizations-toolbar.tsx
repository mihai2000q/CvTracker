import React from 'react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx';
import { RiAddLine, RiSearchLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import CreateOrganizationDialog from '@/features/organizations/components/create-organization-dialog.tsx';
import { Card } from '@/components/ui/card.tsx';
import { Combobox, ComboboxContent, ComboboxInput } from '@/components/ui/combobox.tsx';
import SortCombobox from '@/components/sort/sort-combobox.tsx';
import { buildSortOptions, SortEntry } from '@/lib/sort.ts';
import {
  ORGANIZATION_SORT_PRESETS,
  OrganizationSortField,
} from '@/features/organizations/constants/organization-sorting.tsx';

interface Props {
  sortBy: string[];
  hrefForSortBy: (sortBy: SortEntry<OrganizationSortField>[]) => string;
}

const OrganizationsToolbar = ({ sortBy, hrefForSortBy }: Props) => {
  return (
    <Card className={'flex flex-row gap-4 px-4.5 py-4'}>
      <CreateOrganizationDialog>
        <Button className={'pl-1.5'}>
          <RiAddLine />
          New Organization
        </Button>
      </CreateOrganizationDialog>

      <InputGroup className={'dark:bg-background min-w-48 flex-1'}>
        <InputGroupAddon>
          <RiSearchLine />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search by name..." />
      </InputGroup>

      <Combobox>
        <ComboboxInput
          className={'dark:bg-background w-full sm:w-50'}
          placeholder={'All Countries'}
        />

        <ComboboxContent></ComboboxContent>
      </Combobox>

      <SortCombobox
        options={buildSortOptions(ORGANIZATION_SORT_PRESETS, sortBy, hrefForSortBy)}
        inputProps={{
          className: 'dark:bg-background w-full sm:w-50',
          placeholder: 'Sort organizations by...',
        }}
      />
    </Card>
  );
};

export default OrganizationsToolbar;
