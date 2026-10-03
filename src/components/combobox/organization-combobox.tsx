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
import { InputGroupAddon } from '@/components/ui/input-group.tsx';
import { RiBuilding2Line } from '@remixicon/react';
import { fetchJson } from '@/lib/http/fetch-json.ts';
import { buildSearchParams } from '@/lib/http/url-search-params.ts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx';
import { OrganizationSummary } from '@/features/organizations/types/organization.ts';

interface Props {
  value: string | null;
  onChange: (id: string | null) => void;
}

const OrganizationCombobox = ({ value, onChange }: Props) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ['organizations', debouncedSearch],
    queryFn: async ({ pageParam }) =>
      fetchJson<{ items: OrganizationSummary[]; nextCursor: string | null }>(
        `/api/organizations/search?${buildSearchParams({ search: debouncedSearch, cursor: pageParam })}`
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    staleTime: 5 * 60 * 1000,
  });

  const organizations = data?.pages.flatMap((p) => p.items) ?? [];

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
      <ComboboxInput placeholder={'Select organization...'} disabled={!hasLoaded}>
        <InputGroupAddon className={'p-0'}>
          {!hasLoaded ? <Spinner /> : <RiBuilding2Line />}
        </InputGroupAddon>
      </ComboboxInput>

      <ComboboxContent>
        <ScrollArea viewportProps={{ onScroll: handleScroll, className: 'max-h-63' }}>
          {hasLoaded && organizations.length === 0 && (
            <ComboboxEmpty>No organizations found</ComboboxEmpty>
          )}
          <ComboboxList className="max-h-none overflow-visible">
            {organizations.map((organization) => (
              <ComboboxItem key={organization.id} value={organization.id}>
                <Avatar size={'sm'}>
                  <AvatarFallback>
                    <span>{organization.name[0]}</span>
                  </AvatarFallback>
                </Avatar>
                {organization.name}
              </ComboboxItem>
            ))}
            {isFetching && <Spinner className={'m-3 justify-self-center'} />}
          </ComboboxList>
        </ScrollArea>
      </ComboboxContent>
    </Combobox>
  );
};

export default OrganizationCombobox;
