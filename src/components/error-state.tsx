'use client';

import React, { useEffect } from 'react';
import { RiErrorWarningFill } from '@remixicon/react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty.tsx';
import { Button } from '@/components/ui/button.tsx';

interface Props {
  error: Error & { digest?: string };
  retry: () => void;
  className?: string;
}

const ErrorState = ({ error, retry, className }: Props) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiErrorWarningFill />
        </EmptyMedia>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>
          An unexpected error occurred. Try again, and if it keeps happening, come back later.
          {error.digest && <span className="mt-2 block text-xs">Error ID: {error.digest}</span>}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button onClick={() => retry()}>Try again</Button>
      </EmptyContent>
    </Empty>
  );
};

export default ErrorState;
