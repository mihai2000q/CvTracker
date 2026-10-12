'use client';

import React from 'react';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from '@/components/ui/combobox.tsx';
import JobApplicationSourceIcon from '@/components/icon/job-application-source-icon.tsx';
import { JOB_SOURCES, OTHER_SOURCE } from '@/features/job-applications/constants/job-sources.ts';
import { InputGroupAddon } from '@/components/ui/input-group.tsx';
import { RiLink } from '@remixicon/react';

const sources = [...JOB_SOURCES, OTHER_SOURCE];

const SourceCombobox = ({ className }: { className?: string }) => {
  const anchor = useComboboxAnchor();

  return (
    <Combobox items={sources}>
      <ComboboxInput anchorRef={anchor} className={className} placeholder={'All sources'} showClear>
        <InputGroupAddon>
          <RiLink />
        </InputGroupAddon>
      </ComboboxInput>

      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No sources found</ComboboxEmpty>
        <ComboboxList>
          {(source: string) => (
            <ComboboxItem key={source} value={source}>
              <JobApplicationSourceIcon source={source} />
              {source}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default SourceCombobox;
