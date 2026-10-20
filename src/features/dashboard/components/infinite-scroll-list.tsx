'use client';

import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { fetchJson } from '@/lib/http/fetch-json.ts';
import { buildSearchParams } from '@/lib/http/url-search-params.ts';
import type { CursorPage } from '@/lib/pagination.ts';

interface Props<T extends { id: string }> {
  // The key of the list, given what the server rendered first
  queryKey: (signature: string) => readonly unknown[];
  endpoint: string;
  // What the request is of besides where it is in the list, such as the period
  params?: Record<string, string | undefined>;
  // The first page, which the server already has
  initialPage: CursorPage<T>;
  renderItem: (item: T) => React.ReactNode;
}

// How close to the end of the list, in pixels, the next page starts loading
const LOAD_MORE_THRESHOLD = 48;

// A list that scrolls inside its own box, which fills the room its parent gives it without adding
// to it, and loads the next page when the end is near
function InfiniteScrollList<T extends { id: string }>({
  queryKey,
  endpoint,
  params,
  initialPage,
  renderItem,
}: Props<T>) {
  // The server's page is the start, so the list begins over when the server renders another one
  const signature = JSON.stringify([params, initialPage.items.map(({ id }) => id)]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } =
    useInfiniteQuery({
      queryKey: queryKey(signature),
      queryFn: ({ pageParam }) =>
        fetchJson<CursorPage<T>>(
          `${endpoint}?${buildSearchParams({ ...params, cursor: pageParam })}`
        ),
      initialPageParam: null as string | null,
      initialData: { pages: [initialPage], pageParams: [null as string | null] },
      getNextPageParam: (last) => last.nextCursor,
      // The server's page is current, and a page that has been left must not come back from here
      staleTime: Infinity,
      gcTime: 0,
    });

  const items = data.pages.flatMap((page) => page.items);

  const handleScroll = async (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget;
    // After a failure it is up to the user to try again, not to every scroll
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      !isFetchNextPageError &&
      scrollHeight - scrollTop - clientHeight < LOAD_MORE_THRESHOLD
    ) {
      await fetchNextPage();
    }
  };

  return (
    // The cap is what makes it scroll, and it is chosen so that the card is as tall as the one
    // of the outcomes beside it, with every status in it
    <ScrollArea viewportProps={{ onScroll: handleScroll, className: 'max-h-110' }}>
      <ul className="flex flex-col gap-1 pr-3">
        {items.map((item) => (
          <li key={item.id}>{renderItem(item)}</li>
        ))}
      </ul>
      {isFetchingNextPage && <Spinner className="mx-auto my-3" />}
      {isFetchNextPageError && !isFetchingNextPage && (
        <div
          role="alert"
          className="text-muted-foreground flex items-center justify-center gap-2 py-3 text-xs"
        >
          Could not load more
          <Button size="xs" variant="outline" onClick={() => fetchNextPage()}>
            Retry
          </Button>
        </div>
      )}
    </ScrollArea>
  );
}

export default InfiniteScrollList;
