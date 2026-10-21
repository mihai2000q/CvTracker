import { useState, useTransition } from 'react';
import { toast } from '@/components/ui/toast.tsx';

interface Options<T> {
  // The first page, which the server renders. When it changes the list starts over from it
  initialItems: T[];
  totalCount: number;
  // The items of a page, from 2 on
  loadPage: (page: number) => Promise<T[]>;
  // What happens when a page can't be loaded; a toast by default
  onError?: () => void;
}

const notifyLoadFailed = () =>
  toast.add({ type: 'error', title: 'Could not load more', description: 'Please try again' });

// A list that grows by a page at a time, in state that is local to it
export function usePagedItems<T>({
  initialItems,
  totalCount,
  loadPage,
  onError = notifyLoadFailed,
}: Options<T>) {
  const [state, setState] = useState({ initialItems, more: [] as T[], page: 1 });
  const [isPending, startTransition] = useTransition();

  // Started over when the server sends another first page
  if (state.initialItems !== initialItems) {
    setState({ initialItems, more: [], page: 1 });
  }

  const items = [...initialItems, ...state.more];

  const loadMore = () => {
    // A page is on its way: asking again would fetch the same one and append it twice
    if (isPending) return;
    startTransition(async () => {
      try {
        const next = await loadPage(state.page + 1);
        setState((current) => ({
          ...current,
          more: [...current.more, ...next],
          page: current.page + 1,
        }));
      } catch {
        onError();
      }
    });
  };

  return { items, hasMore: items.length < totalCount, isPending, loadMore };
}
