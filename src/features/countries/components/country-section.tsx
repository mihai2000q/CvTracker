'use client';

import React, { useState } from 'react';
import { RiArrowDownSLine } from '@remixicon/react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible.tsx';

interface Props {
  title: string;
  count: number;
  // What it says when there is nothing in it
  empty: string;
  // Beside the title, while the section is open
  action?: React.ReactNode;
  children: React.ReactNode;
}

// A part of the page of a country that opens and closes
const CountrySection = ({ title, count, empty, action, children }: Props) => {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      render={<section className={'flex flex-col gap-3'} />}
    >
      <div className={'flex items-center justify-between gap-2'}>
        <CollapsibleTrigger
          className={'group/trigger flex w-fit cursor-pointer items-center gap-1.5'}
        >
          <RiArrowDownSLine
            className={
              'text-muted-foreground size-5 -rotate-90 transition-transform duration-200 group-data-panel-open/trigger:rotate-0'
            }
          />
          <h2 className={'text-lg font-semibold'}>{title}</h2>
          <span className={'text-muted-foreground text-sm tabular-nums'}>{count}</span>
        </CollapsibleTrigger>
        {open && count > 1 && action}
      </div>

      <CollapsibleContent>
        {count > 0 ? (
          children
        ) : (
          <div
            className={
              'text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm'
            }
          >
            {empty}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CountrySection;
