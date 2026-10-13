import React from 'react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx';
import { RiSearchLine } from '@remixicon/react';
import { Card } from '@/components/ui/card.tsx';
import SortCombobox from '@/components/sort/sort-combobox.tsx';
import { buildSortOptions, SortEntry } from '@/lib/sort.ts';
import {
  COUNTRY_SORT_PRESETS,
  CountrySortField,
} from '@/features/countries/constants/country-sorting.tsx';

interface Props {
  sortBy: string[];
  hrefForSortBy: (sortBy: SortEntry<CountrySortField>[]) => string;
}

const CountriesToolbar = ({ sortBy, hrefForSortBy }: Props) => {
  return (
    <Card className={'flex flex-row flex-wrap gap-4 px-4.5 py-4'}>
      <InputGroup className={'dark:bg-background min-w-48 flex-1'}>
        <InputGroupAddon>
          <RiSearchLine />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search by name..." />
      </InputGroup>

      <SortCombobox
        options={buildSortOptions(COUNTRY_SORT_PRESETS, sortBy, hrefForSortBy)}
        inputProps={{
          className: 'dark:bg-background w-full sm:w-75',
          placeholder: 'Sort countries by...',
        }}
      />
    </Card>
  );
};

export default CountriesToolbar;
