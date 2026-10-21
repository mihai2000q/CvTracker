'use client';

import { queryKeys } from '@/lib/query-keys.ts';
import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/use-debounced-value.ts';
import { useHasLoadedOnce } from '@/hooks/use-has-loaded-once.ts';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from '@/components/ui/combobox.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { CountrySummary } from '@/features/countries/types/country.ts';
import { InputGroupAddon } from '@/components/ui/input-group.tsx';
import { RiGlobalLine } from '@remixicon/react';
import FlagIcon from '@/features/countries/components/flag-icon.tsx';
import { fetchJson } from '@/lib/http/fetch-json.ts';
import { buildSearchParams } from '@/lib/http/url-search-params.ts';

interface Props {
  value: CountrySummary | null;
  change: (country: CountrySummary | null) => void;
  blur?: () => void;
  id?: string;
  invalid?: boolean;
}

const CountryCombobox = ({ value, change, blur, id, invalid }: Props) => {
  const anchor = useComboboxAnchor();
  const [search, setSearch] = useState(value?.name ?? '');

  // When set from outside, after the first render
  const [internalValue, setInternalValue] = useState(value);
  if (value !== internalValue) {
    setInternalValue(value);
    setSearch(value?.name ?? '');
  }

  const debouncedSearch = useDebouncedValue(search);

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: queryKeys.countrySearch(debouncedSearch),
    queryFn: async ({ pageParam }) =>
      fetchJson<{ items: CountrySummary[]; nextCursor: string | null }>(
        `/api/countries/search?${buildSearchParams({ search: debouncedSearch, cursor: pageParam })}`
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    staleTime: Infinity,
    gcTime: Infinity,
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
      onValueChange={change}
      itemToStringLabel={(country) => country.name}
      isItemEqualToValue={(a, b) => a.id === b.id}
      inputValue={search}
      onInputValueChange={setSearch}
    >
      <ComboboxInput
        anchorRef={anchor}
        id={id}
        aria-invalid={invalid || undefined}
        placeholder={'Select country...'}
        onBlur={blur}
        disabled={!hasLoaded}
      >
        <InputGroupAddon>
          {value ? (
            <FlagIcon isoCode={value.isoCode} circle />
          ) : !hasLoaded ? (
            <Spinner />
          ) : (
            <RiGlobalLine />
          )}
        </InputGroupAddon>
      </ComboboxInput>

      <ComboboxContent anchor={anchor}>
        <ScrollArea viewportProps={{ onScroll: handleScroll, className: 'max-h-63' }}>
          {hasLoaded && countries.length === 0 && <ComboboxEmpty>No countries found</ComboboxEmpty>}
          <ComboboxList className="max-h-none overflow-visible">
            {countries.map((country) => (
              <ComboboxItem key={country.id} value={country}>
                <FlagIcon isoCode={country.isoCode} circle />
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
