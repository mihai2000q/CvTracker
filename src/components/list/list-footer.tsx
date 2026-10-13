import React from 'react';
import AppPagination from '@/components/pagination/app-pagination.tsx';

interface Props {
  shown: number;
  totalCount: number;
  noun: string;
  page: number;
  hrefForPage: (page: number) => string;
}

const ListFooter = ({ shown, totalCount, noun, page, hrefForPage }: Props) => {
  if (totalCount === 0) return null;

  return (
    <div
      className={'flex flex-wrap items-center justify-between gap-2 max-md:flex-col max-md:gap-4'}
    >
      <div className={'text-muted-foreground text-xs'}>
        Displaying {shown} of {totalCount} {noun}
      </div>

      <AppPagination page={page} totalCount={totalCount} hrefForPage={hrefForPage} />
    </div>
  );
};

export default ListFooter;
