import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button.tsx';

interface Props {
  noun: string;
  clearHref: string;
}

const NoResults = ({ noun, clearHref }: Props) => {
  return (
    <div className={'text-muted-foreground flex flex-col items-center gap-1 p-12 pt-28 text-sm'}>
      No {noun} match your filters.
      <Button variant={'ghost'} nativeButton={false} render={<Link href={clearHref} />}>
        Clear filters
      </Button>
    </div>
  );
};

export default NoResults;
