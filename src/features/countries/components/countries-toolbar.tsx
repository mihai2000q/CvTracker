import React from 'react';
import { Card } from '@/components/ui/card.tsx';
import CountriesSearchInput from '@/features/countries/components/countries-search-input.tsx';
import LinkCombobox from '@/components/combobox/link-combobox.tsx';
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
      <CountriesSearchInput
        placeholder="Search by name or ISO code..."
        className={'dark:bg-background min-w-48 flex-1'}
      />

      <LinkCombobox
        options={buildSortOptions(COUNTRY_SORT_PRESETS, sortBy, hrefForSortBy)}
        inputProps={{
          className: 'dark:bg-background min-w-50 sm:w-[20%]',
          placeholder: 'Sort countries by...',
        }}
      />
    </Card>
  );
};

export default CountriesToolbar;
