import React from 'react';
import Link from 'next/link';

interface Props {
  // What the list holds, in the plural
  noun: string;
  // The link back to the whole list
  clearHref: string;
}

// What a list shows when a search or a filter leaves nothing, so it can be undone
const NoResults = ({ noun, clearHref }: Props) => {
  return (
    <div className={'text-muted-foreground py-12 text-center text-sm'}>
      No {noun} match your filters.{' '}
      <Link href={clearHref} className={'link-underline'}>
        Clear filters
      </Link>
    </div>
  );
};

export default NoResults;
