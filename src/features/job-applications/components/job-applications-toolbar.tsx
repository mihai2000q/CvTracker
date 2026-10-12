import React from 'react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx';
import { RiSearchLine } from '@remixicon/react';
import { Combobox, ComboboxContent, ComboboxInput } from '@/components/ui/combobox.tsx';
import SourceCombobox from '@/features/job-applications/components/source/source-combobox.tsx';

const JobApplicationsToolbar = () => {
  return (
    <div className={'flex flex-row flex-wrap gap-4'}>
      <InputGroup className={'min-w-48 flex-1'}>
        <InputGroupAddon>
          <RiSearchLine />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search by name..." />
      </InputGroup>

      <Combobox>
        <ComboboxInput className={'w-full sm:w-50'} placeholder={'All organizations'} />

        <ComboboxContent></ComboboxContent>
      </Combobox>

      <Combobox>
        <ComboboxInput className={'w-full sm:w-40'} placeholder={'All countries'} />

        <ComboboxContent></ComboboxContent>
      </Combobox>

      <SourceCombobox className={'w-full sm:w-43'} />

      <Combobox>
        <ComboboxInput className={'w-full sm:w-40'} placeholder={'All CVs'} />

        <ComboboxContent></ComboboxContent>
      </Combobox>
    </div>
  );
};

export default JobApplicationsToolbar;
