'use client';

import React from 'react';
import SearchInput from '@/components/search/search-input.tsx';
import { useSearchParamsState } from '@/hooks/use-search-params-state.ts';
import { organizationsSearchParamsState } from '@/features/organizations/schemas/organizations-search-params.ts';

const OrganizationsSearchInput = (
  props: Omit<React.ComponentProps<typeof SearchInput>, 'search' | 'onSearch' | 'isPending'>
) => {
  const { values, set, isPending } = useSearchParamsState(organizationsSearchParamsState);

  return (
    <SearchInput
      {...props}
      search={values.search ?? ''}
      onSearch={(search) => set({ search, page: 1 })}
      isPending={isPending}
    />
  );
};

export default OrganizationsSearchInput;
