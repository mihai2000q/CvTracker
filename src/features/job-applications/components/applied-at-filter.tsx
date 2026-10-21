'use client';

import React from 'react';
import DateRangeInput from '@/components/form/date-range-input.tsx';
import { useSearchParamsState } from '@/hooks/use-search-params-state.ts';
import { jobApplicationsSearchParamsState } from '@/features/job-applications/schemas/job-applications-search-params.ts';

interface Props {
  className?: string;
}

// The days the applications were applied on, as the `appliedAt` filter's two ends in the URL
const AppliedAtFilter = ({ className }: Props) => {
  const { values, set } = useSearchParamsState(jobApplicationsSearchParamsState);

  const valueOf = (operator: 'gte' | 'lte') =>
    values.filterBy.find((entry) => entry.field === 'appliedAt' && entry.operator === operator)
      ?.value as string | undefined;

  return (
    <DateRangeInput
      from={valueOf('gte')}
      to={valueOf('lte')}
      placeholder="Any applied date"
      className={className}
      onChange={(range) => {
        const others = values.filterBy.filter((entry) => entry.field !== 'appliedAt');
        const entries: typeof values.filterBy = range
          ? [
              { field: 'appliedAt', operator: 'gte', value: range.from },
              { field: 'appliedAt', operator: 'lte', value: range.to },
            ]
          : [];
        set({ filterBy: [...others, ...entries], page: 1 }, { history: 'push' });
      }}
    />
  );
};

export default AppliedAtFilter;
