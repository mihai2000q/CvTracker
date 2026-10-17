'use client';

import React from 'react';
import { RiArrowDownSLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import { toast } from '@/components/ui/toast.tsx';
import { usePagedItems } from '@/hooks/use-paged-items.ts';
import { fetchJson } from '@/lib/http/fetch-json.ts';
import { buildSearchParams } from '@/lib/http/url-search-params.ts';
import { Page } from '@/lib/pagination.ts';
import CountryJobApplicationItem from '@/features/countries/components/country-job-application-item.tsx';
import { COUNTRY_JOB_APPLICATIONS_PAGE_SIZE } from '@/features/countries/constants/country-page.ts';
import type { CountryJobApplication } from '@/features/countries/types/country-job-application.ts';

interface Props {
  countryId: string;
  initialJobApplications: CountryJobApplication[];
  totalCount: number;
}

const CountryJobApplicationsList = ({ countryId, initialJobApplications, totalCount }: Props) => {
  const { items, hasMore, isPending, loadMore } = usePagedItems({
    initialItems: initialJobApplications,
    totalCount,
    loadPage: async (page) =>
      (
        await fetchJson<Page<CountryJobApplication>>(
          `/api/countries/${countryId}/job-applications?${buildSearchParams({ page, pageSize: COUNTRY_JOB_APPLICATIONS_PAGE_SIZE })}`
        )
      ).items,
    onError: () =>
      toast.add({ type: 'error', title: 'Could not load more', description: 'Please try again' }),
  });

  return (
    <>
      <ul role="list" className={'grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3'}>
        {items.map((jobApplication) => (
          <li key={jobApplication.id}>
            <CountryJobApplicationItem jobApplication={jobApplication} />
          </li>
        ))}
      </ul>

      <div className={'mt-3 flex flex-wrap items-center justify-between gap-2 max-sm:flex-col'}>
        <div className={'text-muted-foreground text-xs'}>
          Displaying {items.length} of {totalCount} applications
        </div>
        {hasMore && (
          <Button variant={'ghost'} size={'sm'} loading={isPending} onClick={loadMore}>
            Show {Math.min(COUNTRY_JOB_APPLICATIONS_PAGE_SIZE, totalCount - items.length)} more
            <RiArrowDownSLine />
          </Button>
        )}
      </div>
    </>
  );
};

export default CountryJobApplicationsList;
