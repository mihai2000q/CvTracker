'use client';

import React from 'react';
import { RiArrowDownSLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import { usePagedItems } from '@/hooks/use-paged-items.ts';
import { fetchJson } from '@/lib/http/fetch-json.ts';
import { buildSearchParams } from '@/lib/http/url-search-params.ts';
import { Page } from '@/lib/pagination.ts';
import CountryOrganizationItem from '@/features/countries/components/country-organization-item.tsx';
import { COUNTRY_ORGANIZATIONS_PAGE_SIZE } from '@/features/countries/constants/country-page.ts';
import type { CountrySummary } from '@/features/countries/types/country.ts';
import type { CountryOrganization } from '@/features/countries/types/country-organization.ts';

interface Props {
  country: CountrySummary;
  initialOrganizations: CountryOrganization[];
  totalCount: number;
}

const CountryOrganizationsList = ({ country, initialOrganizations, totalCount }: Props) => {
  const { items, hasMore, isPending, loadMore } = usePagedItems({
    initialItems: initialOrganizations,
    totalCount,
    loadPage: async (page) =>
      (
        await fetchJson<Page<CountryOrganization>>(
          `/api/countries/${country.id}/organizations?${buildSearchParams({ page, pageSize: COUNTRY_ORGANIZATIONS_PAGE_SIZE })}`
        )
      ).items,
  });

  return (
    <>
      <ul role="list" className={'grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3'}>
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
    </>
  );
};

export default CountryOrganizationsList;
