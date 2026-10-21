'use client';

import * as React from 'react';
import Link from 'next/link';
import { RiArrowDownSLine, RiArrowUpLine } from '@remixicon/react';
import { cn } from '@/lib/utils.ts';
import { TableHead } from '@/components/ui/table.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import type { ColumnSort } from '@/lib/sort.ts';

interface Props extends React.ComponentProps<'th'> {
  options: (ColumnSort & { label: string })[];
}

const TableHeadSortMenu = ({ options, children, ...props }: Props) => {
  const active = options.some((option) => option.direction);

  return (
    <TableHead {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger
          data-slot="table-head-sort-menu-trigger"
          className={cn(
            'hover:text-foreground inline-flex cursor-pointer items-center gap-1 uppercase transition-colors',
            active && 'text-foreground'
          )}
        >
          {children}
          <RiArrowDownSLine className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-auto" sideOffset={10}>
          {options.map(({ label, direction, href }) => (
            <DropdownMenuItem key={label} render={<Link href={href} prefetch={false} />}>
              <RiArrowUpLine
                className={cn(
                  'transition-transform',
                  direction === 'desc' && 'rotate-180',
                  !direction && 'opacity-0'
                )}
              />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </TableHead>
  );
};

export default TableHeadSortMenu;
