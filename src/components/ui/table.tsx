'use client';

import * as React from 'react';
import { cn } from '@/lib/utils.ts';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <ScrollArea
      data-slot="table-container"
      orientation="horizontal"
      className="w-full rounded-lg border"
    >
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', 'rounded-lg', className)}
        {...props}
      />
    </ScrollArea>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('hover:bg-muted/15 transition-colors', className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn('bg-card', className)} {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'not-in-data-[slot=table-header]:hover:bg-muted/50 has-aria-expanded:bg-muted/50 aria-selected:bg-muted transition-colors',
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'text-muted-foreground border-b px-5 py-4 text-left align-middle text-xs font-medium whitespace-nowrap uppercase [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-5 py-3.5 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
