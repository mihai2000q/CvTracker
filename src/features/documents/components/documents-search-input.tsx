'use client';

import React from 'react';
import SearchInput from '@/components/search/search-input.tsx';
import { useSearchParamsState } from '@/hooks/use-search-params-state.ts';
import { documentsSearchParamsState } from '@/features/documents/schemas/documents-search-params.ts';

const DocumentsSearchInput = (
  props: Pick<React.ComponentProps<typeof SearchInput>, 'placeholder' | 'className'>
) => {
  const { values, set, isPending } = useSearchParamsState(documentsSearchParamsState);

  return (
    <SearchInput
      {...props}
      search={values.search ?? ''}
      onSearch={(search) => set({ search, page: 1 })}
      isPending={isPending}
    />
  );
};

export default DocumentsSearchInput;
