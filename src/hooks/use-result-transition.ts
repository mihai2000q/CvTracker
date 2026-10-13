'use client';

import { useTransition } from 'react';
import { toast } from '@/components/ui/toast.tsx';
import type { Result } from '@/types/result.ts';

interface Options<T> {
  onSuccess?: (data: T | undefined) => void;
}

// startTransition for actions that return a Result: a failure is shown as an
// error toast, so callers only handle the success case
export function useResultTransition() {
  const [isPending, startTransition] = useTransition();

  function run<T>(action: () => Promise<Result<T>>, { onSuccess }: Options<T> = {}) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        onSuccess?.(result.data);
        return;
      }
      toast.add({
        type: 'error',
        title: 'Something went wrong',
        description: Object.values(result.errors).flat().join(' '),
      });
    });
  }

  return [isPending, run] as const;
}
