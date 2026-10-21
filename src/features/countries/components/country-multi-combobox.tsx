'use client';

import { queryKeys } from '@/lib/query-keys.ts';
import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/use-debounced-value.ts';
import { useHasLoadedOnce } from '@/hooks/use-has-loaded-once.ts';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { CountrySummary } from '@/features/countries/types/country.ts';
import FlagIcon from '@/features/countries/components/flag-icon.tsx';
import { RiGlobalLine } from '@remixicon/react';
import { InputGroupAddon } from '@/components/ui/input-group.tsx';
import { fetchJson } from '@/lib/http/fetch-json.ts';
import { buildSearchParams } from '@/lib/http/url-search-params.ts';

interface Props {
  defaultValue?: CountrySummary[];
  onChange: (ids: string[]) => void;
  onBlur?: () => void;
}

const CountryMultiCombobox = ({ defaultValue, onChange, onBlur }: Props) => {
  const anchor = useComboboxAnchor();

  const [selectedCountries, setSelectedCountries] = useState<CountrySummary[]>(defaultValue ?? []);
  const handleValueChange = (next: CountrySummary[]) => {
    setSelectedCountries(next);
    onChange(next.map((country) => country.id));
  };

  const [search, setSearch] = useState('');
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
      multiple
      autoHighlight
      disabled={!hasLoaded}
      value={selectedCountries}
      onValueChange={handleValueChange}
      isItemEqualToValue={(a, b) => a.id === b.id}
      inputValue={search}
      onInputValueChange={setSearch}
    >
      <ComboboxChips ref={anchor} data-disabled={!hasLoaded}>
        <InputGroupAddon className={'p-0'}>
          {!hasLoaded ? <Spinner /> : <RiGlobalLine />}
        </InputGroupAddon>
        <ComboboxValue>
          {(values: CountrySummary[]) => (
            <React.Fragment>
              {values.map((country) => (
                <ComboboxChip key={country.id}>
                  <FlagIcon isoCode={country.isoCode} />
                  {country.name}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={values.length === 0 ? 'Select countries...' : undefined}
                onBlur={onBlur}
                disabled={!hasLoaded}
              />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>

      <ComboboxContent anchor={anchor}>
        <ScrollArea viewportProps={{ onScroll: handleScroll, className: 'max-h-63' }}>
          {!isFetching && countries.length === 0 && (
            <ComboboxEmpty>No countries found</ComboboxEmpty>
          )}
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

export default CountryMultiCombobox;
