'use client';

import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { buildSearchParamsHref, type SearchParamsState } from '@/lib/search-params.ts';

interface NavigateOptions {
  history?: 'replace' | 'push';
  scroll?: boolean;
}

export function useSearchParamsState<T>(state: SearchParamsState<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const values = state.deserialize(new URLSearchParams(searchParams));
  const hrefFor = (patch: Partial<T>) =>
    buildSearchParamsHref(pathname, state, new URLSearchParams(searchParams), {
      ...values,
      ...patch,
    });

  const set = (patch: Partial<T>, { history = 'replace', scroll = false }: NavigateOptions = {}) =>
    startTransition(() => router[history](hrefFor(patch), { scroll }));

  return { values, hrefFor, set, isPending };
}
