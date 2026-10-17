import { useState, useTransition } from 'react';

interface Options<T> {
  // The first page, which the server renders. When it changes the list starts over from it
  initialItems: T[];
  totalCount: number;
  // The items of a page, from 2 on
  loadPage: (page: number) => Promise<T[]>;
  onError?: () => void;
}

// A list that grows by a page at a time, in state that is local to it
export function usePagedItems<T>({ initialItems, totalCount, loadPage, onError }: Options<T>) {
  const [state, setState] = useState({ initialItems, more: [] as T[], page: 1 });
  const [isPending, startTransition] = useTransition();

  // Started over when the server sends another first page
  if (state.initialItems !== initialItems) {
    setState({ initialItems, more: [], page: 1 });
  }

  const items = [...initialItems, ...state.more];

  const loadMore = () => {
    startTransition(async () => {
      try {
        const next = await loadPage(state.page + 1);
        setState((current) => ({
          ...current,
          more: [...current.more, ...next],
          page: current.page + 1,
        }));
      } catch {
        onError?.();
      }
    });
  };

  return { items, hasMore: items.length < totalCount, isPending, loadMore };
}
