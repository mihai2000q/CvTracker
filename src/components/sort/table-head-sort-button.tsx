import * as React from 'react';
import Link from 'next/link';
import { RiArrowUpLine } from '@remixicon/react';
import { cn } from 'cn';
import { TableHead } from '@/components/ui/table.tsx';
import type { ColumnSort } from '@/lib/sort.ts';

interface Props extends React.ComponentProps<'th'> {
  sort: ColumnSort;
}

const TableHeadSortButton = ({ sort: { direction, href }, children, ...props }: Props) => {
  return (
    <TableHead {...props}>
      <Link
        href={href}
        prefetch={false}
        data-slot="table-head-sort-button"
        className={cn(
          'hover:text-foreground inline-flex items-center gap-1.5 transition-colors',
          direction && 'text-foreground'
        )}
      >
        {children}
        <RiArrowUpLine
          className={cn(
            'size-3.5 transition-transform duration-200',
            direction === 'desc' && 'rotate-180',
            !direction && 'opacity-40'
          )}
        />
      </Link>
    </TableHead>
  );
};

export default TableHeadSortButton;
