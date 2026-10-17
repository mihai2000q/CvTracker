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
import CountryOrganizationItem from '@/features/countries/components/country-organization-item.tsx';
import CountrySection from '@/features/countries/components/country-section.tsx';
import { COUNTRY_ORGANIZATIONS_PAGE_SIZE } from '@/features/countries/constants/country-page.ts';
import { COUNTRY_ORGANIZATION_SORT_PRESETS } from '@/features/countries/constants/country-organization-sorting.tsx';
import type { CountrySummary } from '@/features/countries/types/country.ts';
import type { CountryOrganization } from '@/features/countries/types/country-organization.ts';

interface Props {
  country: CountrySummary;
  // The first page, alphabetical, which the server renders
  initialOrganizations: CountryOrganization[];
  totalCount: number;
}

type SortPreset = (typeof COUNTRY_ORGANIZATION_SORT_PRESETS)[number];

// The organizations in a country, with the control that sorts them. The order is kept here and
// not in the URL: another one fetches the first page again, and "Show more" goes on from it.
const CountryOrganizationsSection = ({ country, initialOrganizations, totalCount }: Props) => {
  const [sort, setSort] = useState<SortPreset>(COUNTRY_ORGANIZATION_SORT_PRESETS[0]);
  const [firstPage, setFirstPage] = useState(initialOrganizations);
  const [isSorting, startSorting] = useTransition();

  const fetchPage = async (preset: SortPreset, page: number) =>
    (
      await fetchJson<Page<CountryOrganization>>(
        `/api/countries/${country.id}/organizations?${buildSearchParams({
          sortBy: serializeSort(preset.sortBy),
          page,
          pageSize: COUNTRY_ORGANIZATIONS_PAGE_SIZE,
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
      title={'Organizations'}
      count={totalCount}
      empty={'No organizations in this country yet'}
      action={
        <OptionCombobox
          options={COUNTRY_ORGANIZATION_SORT_PRESETS}
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
          'grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3 transition-opacity data-[sorting=true]:opacity-50'
        }
        data-sorting={isSorting}
      >
        {items.map((organization) => (
          <li key={organization.id}>
            <CountryOrganizationItem organization={organization} country={country} />
          </li>
        ))}
      </ul>

      <div className={'mt-3 flex flex-wrap items-center justify-between gap-2 max-sm:flex-col'}>
        <div className={'text-muted-foreground text-xs'}>
          Displaying {items.length} of {totalCount} organizations
        </div>
        {hasMore && (
          <Button variant={'ghost'} size={'sm'} loading={isPending} onClick={loadMore}>
            Show {Math.min(COUNTRY_ORGANIZATIONS_PAGE_SIZE, totalCount - items.length)} more
            <RiArrowDownSLine />
          </Button>
        )}
      </div>
    </CountrySection>
  );
};

export default CountryOrganizationsSection;
