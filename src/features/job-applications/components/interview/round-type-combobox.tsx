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
import { ROUND_TYPE_LABELS } from '@/features/job-applications/constants/round-types.ts';
import { RoundType } from '@/features/job-applications/types/enums/round-type.ts';

const roundTypes = Object.values(RoundType);

interface Props {
  name: string;
  change: (roundType: string) => void;
  blur?: () => void;
  id?: string;
  invalid?: boolean;
}

const RoundTypeCombobox = ({ name, change, blur, id, invalid }: Props) => {
  const anchor = useComboboxAnchor();

  return (
    <Combobox
      items={roundTypes}
      name={name}
      itemToStringLabel={(roundType: RoundType) => ROUND_TYPE_LABELS[roundType]}
      onValueChange={(roundType) => change(roundType ?? '')}
    >
      <ComboboxInput
        anchorRef={anchor}
        id={id}
        aria-invalid={invalid || undefined}
        placeholder={'Select a type...'}
        onBlur={blur}
      />

      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No types found</ComboboxEmpty>
        <ComboboxList>
          {(roundType: RoundType) => (
            <ComboboxItem key={roundType} value={roundType}>
              {ROUND_TYPE_LABELS[roundType]}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export default RoundTypeCombobox;
