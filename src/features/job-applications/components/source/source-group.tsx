'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input.tsx';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group.tsx';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible.tsx';
import JobApplicationSourceIcon from '@/features/job-applications/components/source/job-application-source-icon.tsx';
import { JOB_SOURCES, OTHER_SOURCE } from '@/features/job-applications/constants/job-sources.ts';

const sources = [...JOB_SOURCES, OTHER_SOURCE];

interface Props {
  defaultValue?: string;
  change: (source: string) => void;
  blur?: () => void;
}

const SourceGroup = ({ defaultValue, change, blur }: Props) => {
  const isKnown =
    defaultValue !== undefined && JOB_SOURCES.some((source) => source === defaultValue);
  const [selected, setSelected] = useState<string | undefined>(
    defaultValue ? (isKnown ? defaultValue : OTHER_SOURCE) : undefined
  );
  const [other, setOther] = useState(defaultValue && !isKnown ? defaultValue : '');

  const handleSelectedChange = ([label]: string[]) => {
    setSelected(label);
    change(label === OTHER_SOURCE ? other.trim() : (label ?? ''));
  };

  return (
    <>
      <ToggleGroup
        size={'sm'}
        variant={'primary'}
        className={'flex-wrap'}
        value={selected ? [selected] : []}
        onValueChange={handleSelectedChange}
        onBlur={blur}
      >
        {sources.map((label) => (
          <ToggleGroupItem key={label} value={label} className={'rounded-full'}>
            <JobApplicationSourceIcon source={label} className={'size-3'} />
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Collapsible open={selected === OTHER_SOURCE}>
        <CollapsibleContent>
          <Input
            value={other}
            onChange={(event) => {
              setOther(event.target.value);
              change(event.target.value.trim());
            }}
            placeholder="Enter another source..."
            maxLength={100}
          />
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};

export default SourceGroup;
