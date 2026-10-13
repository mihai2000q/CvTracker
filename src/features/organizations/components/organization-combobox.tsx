'use client';

import { queryKeys } from '@/lib/query-keys.ts';
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
  useComboboxAnchor,
} from '@/components/ui/combobox.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { InputGroupAddon } from '@/components/ui/input-group.tsx';
import { RiBuilding2Line } from '@remixicon/react';
import { fetchJson } from '@/lib/http/fetch-json.ts';
import { buildSearchParams } from '@/lib/http/url-search-params.ts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx';
import { OrganizationSummary } from '@/features/organizations/types/organization.ts';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card.tsx';

const OrganizationHoverCard = ({ organization }: { organization: OrganizationSummary }) => (
  <HoverCard>
    <HoverCardTrigger
      closeDelay={100}
      render={
        <Avatar className={'size-6 rounded-md'}>
          <AvatarFallback>
            <span className={'text-xs'}>{organization.name[0]}</span>
          </AvatarFallback>
        </Avatar>
      }
    />
    <HoverCardContent className="flex max-w-64 flex-row items-center gap-3">
      <Avatar className={'size-15 shrink-0 rounded-lg'}>
        <AvatarFallback>
          <span className={'text-xl'}>{organization.name[0]}</span>
        </AvatarFallback>
      </Avatar>
      <div className={'flex min-w-0 flex-col gap-px'}>
        <div className={'truncate text-[1rem] font-bold'} title={organization.name}>
          {organization.name}
        </div>
        <span
          className={'text-muted-foreground line-clamp-2 text-[0.70rem] leading-none font-medium'}
        >
          {organization.countries.map((country) => country.name).join(', ')}
        </span>
      </div>
    </HoverCardContent>
  </HoverCard>
);

interface Props {
  // Name of the hidden field that carries a picked organization's id
  idName: string;
  // A picked organization, or the name typed for a new one
  change: (organization: OrganizationSummary | string) => void;
  blur?: () => void;
  id?: string;
  invalid?: boolean;
}

const OrganizationCombobox = ({ idName, change, blur, id, invalid }: Props) => {
  const [selected, setSelected] = useState<OrganizationSummary | null>(null);
  const anchor = useComboboxAnchor();
  const [search, setSearch] = useState('');

  const handleValueChange = (organization: OrganizationSummary | null) => {
    if (!organization) return;
    setSearch(organization.name);
    setSelected(organization);
    change(organization);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setSelected(null);
    change(event.target.value.trim());
  };

  const debouncedSearch = useDebouncedValue(search);

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: queryKeys.organizationSearch(debouncedSearch),
    queryFn: async ({ pageParam }) =>
      fetchJson<{ items: OrganizationSummary[]; nextCursor: string | null }>(
        `/api/organizations/search?${buildSearchParams({ search: debouncedSearch, cursor: pageParam })}`
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
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
      name={idName}
      value={selected}
      onValueChange={handleValueChange}
      itemToStringLabel={(option) => option.name}
      itemToStringValue={(option) => option.id}
      isItemEqualToValue={(a, b) => a.id === b.id}
      inputValue={search}
    >
      <ComboboxInput
        anchorRef={anchor}
        id={id}
        aria-invalid={invalid || undefined}
        placeholder={'Enter organization...'}
        onChange={handleInputChange}
        onBlur={blur}
        disabled={!hasLoaded}
      >
        <InputGroupAddon>
          {selected ? (
            <OrganizationHoverCard organization={selected} />
          ) : !hasLoaded ? (
            <Spinner />
          ) : (
            <RiBuilding2Line />
          )}
        </InputGroupAddon>
      </ComboboxInput>

      <ComboboxContent anchor={anchor}>
        <ScrollArea viewportProps={{ onScroll: handleScroll, className: 'max-h-63' }}>
          {hasLoaded && organizations.length === 0 && (
            <ComboboxEmpty>No organizations found</ComboboxEmpty>
          )}
          <ComboboxList className="max-h-none overflow-visible">
            {organizations.map((organization) => (
              <ComboboxItem key={organization.id} value={organization}>
                <Avatar size={'sm'} className={'rounded-lg'}>
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
