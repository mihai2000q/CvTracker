'use client';

import React from 'react';
import SearchInput from '@/components/search/search-input.tsx';
import { useSearchParamsState } from '@/hooks/use-search-params-state.ts';
import { jobApplicationsSearchParamsState } from '@/features/job-applications/schemas/job-applications-search-params.ts';

const JobApplicationsSearchInput = (
  props: Omit<React.ComponentProps<typeof SearchInput>, 'search' | 'onSearch' | 'isPending'>
) => {
  const { values, set, isPending } = useSearchParamsState(jobApplicationsSearchParamsState);

  return (
    <SearchInput
      {...props}
      search={values.search ?? ''}
      onSearch={(search) => set({ search, page: 1 })}
      isPending={isPending}
    />
  );
};

export default JobApplicationsSearchInput;
