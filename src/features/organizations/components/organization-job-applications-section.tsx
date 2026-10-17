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
import OrganizationJobApplicationCard from '@/features/organizations/components/organization-job-application-card.tsx';
import { ORGANIZATION_JOB_APPLICATIONS_PAGE_SIZE } from '@/features/organizations/constants/organization-page.ts';
import { ORGANIZATION_JOB_APPLICATION_SORT_PRESETS } from '@/features/organizations/constants/organization-job-application-sorting.tsx';
import type { JobApplicationSummary } from '@/features/job-applications/types/job-application-summary.ts';

interface Props {
  organizationId: string;
  initialJobApplications: JobApplicationSummary[];
  totalCount: number;
}

type SortPreset = (typeof ORGANIZATION_JOB_APPLICATION_SORT_PRESETS)[number];

const OrganizationJobApplicationsSection = ({
  organizationId,
  initialJobApplications,
  totalCount,
}: Props) => {
  const [sort, setSort] = useState<SortPreset>(ORGANIZATION_JOB_APPLICATION_SORT_PRESETS[0]);
  const [firstPage, setFirstPage] = useState(initialJobApplications);
  const [isSorting, startSorting] = useTransition();

  const fetchPage = async (preset: SortPreset, page: number) =>
    (
      await fetchJson<Page<JobApplicationSummary>>(
        `/api/job-applications/summaries?${buildSearchParams({
          organizationId,
          sortBy: serializeSort(preset.sortBy),
          page,
          pageSize: ORGANIZATION_JOB_APPLICATIONS_PAGE_SIZE,
        })}`
      )
    ).items;
  const showSortError = () =>
    toast.add({ type: 'error', title: 'Could not sort', description: 'Please try again' });

  const { items, hasMore, isPending, loadMore } = usePagedItems({
    initialItems: firstPage,
    totalCount,
    loadPage: (page) => fetchPage(sort, page),
  });

  async function handleSortChange(next: SortPreset) {
    const previous = sort;
    setSort(next);
    startSorting(async () => {
      try {
        setFirstPage(await fetchPage(next, 1));
      } catch {
        setSort(previous);
        showSortError();
      }
    });
  }

  return (
    <section className={'flex flex-col gap-3'}>
      <div className={'flex items-center justify-between gap-2'}>
        <div className={'flex items-baseline gap-1.5'}>
          <h2 className={'text-lg font-semibold'}>Job Applications</h2>
          <span className={'text-muted-foreground text-sm tabular-nums'}>{totalCount}</span>
        </div>
        {totalCount > 1 && (
          <OptionCombobox
            options={ORGANIZATION_JOB_APPLICATION_SORT_PRESETS}
            value={sort}
            onValueChange={handleSortChange}
            contentClassName={'w-max max-w-[min(20rem,var(--available-width))]'}
            inputProps={{ variant: 'ghost', placeholder: 'Sort by...', className: 'w-52' }}
          />
        )}
      </div>

      {totalCount > 0 ? (
        <>
          <ul
            role="list"
            aria-busy={isSorting}
            className={
              'grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-3 transition-opacity data-[sorting=true]:opacity-50'
            }
            data-sorting={isSorting}
          >
            {items.map((jobApplication) => (
              <li key={jobApplication.id}>
                <OrganizationJobApplicationCard jobApplication={jobApplication} />
              </li>
            ))}
          </ul>

          <div className={'mt-3 flex flex-wrap items-center justify-between gap-2 max-sm:flex-col'}>
            <div className={'text-muted-foreground text-xs'}>
              Displaying {items.length} of {totalCount} applications
            </div>
            {hasMore && (
              <Button variant={'ghost'} size={'sm'} loading={isPending} onClick={loadMore}>
                Show {Math.min(ORGANIZATION_JOB_APPLICATIONS_PAGE_SIZE, totalCount - items.length)}{' '}
                more
                <RiArrowDownSLine />
              </Button>
            )}
          </div>
        </>
      ) : (
        <div
          className={
            'text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm'
          }
        >
          No job applications sent to this organization yet
        </div>
      )}
    </section>
  );
};

export default OrganizationJobApplicationsSection;
