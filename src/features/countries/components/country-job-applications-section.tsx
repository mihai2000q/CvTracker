'use client';

import React, { useState, useTransition } from 'react';
import { RiArrowDownSLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import { toast } from '@/components/ui/toast.tsx';
import OptionCombobox from '@/components/combobox/option-combobox.tsx';
import { usePagedItems } from '@/hooks/use-paged-items.ts';
import { fetchJson } from '@/lib/http/fetch-json.ts';
import { buildSearchParams } from '@/lib/http/url-search-params.ts';
import { Page } from '@/lib/pagination.ts';
import { serializeSort } from '@/lib/sort.ts';
import CountryJobApplicationItem from '@/features/countries/components/country-job-application-item.tsx';
import CountrySection from '@/features/countries/components/country-section.tsx';
import { COUNTRY_JOB_APPLICATIONS_PAGE_SIZE } from '@/features/countries/constants/country-page.ts';
import { COUNTRY_JOB_APPLICATION_SORT_PRESETS } from '@/features/countries/constants/country-job-application-sorting.tsx';
import type { JobApplicationSummary } from '@/features/job-applications/types/job-application-summary.ts';

interface Props {
  countryId: string;
  // The first page, by applied date descending, which the server renders
  initialJobApplications: JobApplicationSummary[];
  totalCount: number;
}

type SortPreset = (typeof COUNTRY_JOB_APPLICATION_SORT_PRESETS)[number];

// The job applications sent to a country, with the control that sorts them. The order is kept
// here and not in the URL: another one fetches the first page again, and "Show more" goes on
// from it.
const CountryJobApplicationsSection = ({
  countryId,
  initialJobApplications,
  totalCount,
}: Props) => {
  const [sort, setSort] = useState<SortPreset>(COUNTRY_JOB_APPLICATION_SORT_PRESETS[0]);
  const [firstPage, setFirstPage] = useState(initialJobApplications);
  const [isSorting, startSorting] = useTransition();

  const fetchPage = async (preset: SortPreset, page: number) =>
    (
      await fetchJson<Page<JobApplicationSummary>>(
        `/api/job-applications/summaries?${buildSearchParams({
          countryId,
          sortBy: serializeSort(preset.sortBy),
          page,
          pageSize: COUNTRY_JOB_APPLICATIONS_PAGE_SIZE,
        })}`
      )
    ).items;

  const { items, hasMore, isPending, loadMore } = usePagedItems({
    initialItems: firstPage,
    totalCount,
    loadPage: (page) => fetchPage(sort, page),
  });

  function handleSortChange(next: SortPreset) {
    const previous = sort;
    setSort(next);
    startSorting(async () => {
      try {
        setFirstPage(await fetchPage(next, 1));
      } catch {
        setSort(previous);
        toast.add({ type: 'error', title: 'Could not sort', description: 'Please try again' });
      }
    });
  }

  return (
    <CountrySection
      title={'Job Applications'}
      count={totalCount}
      empty={'No job applications sent to this country yet'}
      action={
        <OptionCombobox
          options={COUNTRY_JOB_APPLICATION_SORT_PRESETS}
          value={sort}
          onValueChange={handleSortChange}
          contentClassName={'w-max max-w-[min(20rem,var(--available-width))]'}
          inputProps={{ variant: 'ghost', placeholder: 'Sort by...', className: 'w-52' }}
        />
      }
    >
      <ul
        role="list"
        aria-busy={isSorting}
        className={
          'grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3 transition-opacity data-[sorting=true]:opacity-50'
        }
        data-sorting={isSorting}
      >
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
    </CountrySection>
  );
};

export default CountryJobApplicationsSection;
