import React from 'react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx';
import { RiSearchLine } from '@remixicon/react';
import { Combobox, ComboboxContent, ComboboxInput } from '@/components/ui/combobox.tsx';
import { Card } from '@/components/ui/card.tsx';

const CountriesToolbar = () => {
  return (
    <Card className={'flex flex-row flex-wrap gap-4 px-4.5 py-4'}>
      <InputGroup className={'dark:bg-background min-w-48 flex-1'}>
        <InputGroupAddon>
          <RiSearchLine />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search by name..." />
      </InputGroup>

      <Combobox>
        <ComboboxInput
          className={'dark:bg-background w-full sm:w-75'}
          placeholder={'Sort: Last Active'}
        />

        <ComboboxContent></ComboboxContent>
      </Combobox>
    </Card>
  );
};

export default CountriesToolbar;
