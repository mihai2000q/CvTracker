'use client';

import React, { useState } from 'react';
import { RiGlobalLine, RiGroupLine, RiLinkedinLine } from '@remixicon/react';
import { Input } from '@/components/ui/input.tsx';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group.tsx';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible.tsx';

const OTHER = 'Other';
const iconStyle = { width: 'inherit', height: 'inherit' };

const sources = [
  { label: 'LinkedIn', icon: <RiLinkedinLine style={iconStyle} /> },
  { label: 'Indeed', icon: <RiLinkedinLine style={iconStyle} /> },
  { label: 'Stepstone', icon: <RiLinkedinLine style={iconStyle} /> },
  { label: 'Company site', icon: <RiGlobalLine style={iconStyle} /> },
  { label: 'Referral', icon: <RiGroupLine style={iconStyle} /> },
  { label: OTHER, icon: <RiGroupLine style={iconStyle} /> },
];

interface Props {
  change: (source: string) => void;
  blur?: () => void;
}

const SourceGroup = ({ change, blur }: Props) => {
  const [selected, setSelected] = useState<string>();
  const [other, setOther] = useState('');

  const handleSelectedChange = ([label]: string[]) => {
    setSelected(label);
    change(label === OTHER ? other.trim() : (label ?? ''));
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
        {sources.map(({ label, icon }) => (
          <ToggleGroupItem key={label} value={label} className={'rounded-full'}>
            <span className={'size-3'}>{icon}</span>
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Collapsible open={selected === OTHER}>
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
