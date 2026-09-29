'use client';

import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useHasLoadedOnce } from '@/hooks/use-has-loaded-once';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { CountrySummary } from '@/features/countries/types/country.ts';
import { InputGroupAddon } from '@/components/ui/input-group.tsx';
import { RiGlobalLine } from '@remixicon/react';
import FlagIcon from '@/components/icon/flag-icon.tsx';
import { fetchJson } from '@/lib/fetch-json.ts';
import { buildSearchParams } from '@/lib/url-search-params.ts';

interface Props {
  value: string | null;
  onChange: (id: string | null) => void;
}

const CountryCombobox = ({ value, onChange }: Props) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ['countries', debouncedSearch],
    queryFn: async ({ pageParam }) =>
      fetchJson<{ items: CountrySummary[]; nextCursor: string | null }>(
        `/api/countries/search?${buildSearchParams({ search: debouncedSearch, cursor: pageParam })}`
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    staleTime: 5 * 60 * 1000, // countries rarely change
  });

  const countries = data?.pages.flatMap((p) => p.items) ?? [];

  const hasLoaded = useHasLoadedOnce(data);

  const handleScroll = async (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget;
    if (hasNextPage && scrollHeight - scrollTop - clientHeight < 48) {
      await fetchNextPage();
    }
  };

  return (
    <Combobox
      disabled={!hasLoaded}
      value={value}
      onValueChange={onChange}
      inputValue={search}
      onInputValueChange={setSearch}
    >
      <ComboboxInput placeholder={'Select country...'} disabled={!hasLoaded}>
        <InputGroupAddon className={'p-0'}>
          {!hasLoaded ? <Spinner /> : <RiGlobalLine />}
        </InputGroupAddon>
      </ComboboxInput>

      <ComboboxContent>
        <ScrollArea viewportProps={{ onScroll: handleScroll, className: 'max-h-63' }}>
          {hasLoaded && countries.length === 0 && (
            <ComboboxEmpty>No countries found</ComboboxEmpty>
          )}
          <ComboboxList className="max-h-none overflow-visible">
            {countries.map((country) => (
              <ComboboxItem key={country.id} value={country.id}>
                <FlagIcon isoCode={country.isoCode} />
                {country.name}
              </ComboboxItem>
            ))}
            {isFetching && <Spinner className={'m-3 justify-self-center'} />}
          </ComboboxList>
        </ScrollArea>
      </ComboboxContent>
    </Combobox>
  );
};

export default CountryCombobox;
