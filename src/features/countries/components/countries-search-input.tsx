'use client';

import React from 'react';
import SearchInput from '@/components/search/search-input.tsx';
import { useSearchParamsState } from '@/hooks/use-search-params-state.ts';
import { countriesSearchParamsState } from '@/features/countries/schemas/countries-search-params.ts';

const CountriesSearchInput = (
  props: Omit<React.ComponentProps<typeof SearchInput>, 'search' | 'onSearch' | 'isPending'>
) => {
  const { values, set, isPending } = useSearchParamsState(countriesSearchParamsState);

  return (
    <SearchInput
      {...props}
      search={values.search ?? ''}
      onSearch={(search) => set({ search, page: 1 })}
      isPending={isPending}
    />
  );
};

export default CountriesSearchInput;
