import React from 'react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx';
import { RiAddLine, RiSearchLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import CreateDocumentDialog from '@/features/documents/components/create-document-dialog.tsx';
import { Card } from '@/components/ui/card.tsx';
import { Combobox, ComboboxContent, ComboboxInput } from '@/components/ui/combobox.tsx';

const DocumentsToolbar = () => {
  return (
    <Card className={'flex flex-row flex-wrap gap-4 px-4.5 py-4'}>
      <CreateDocumentDialog>
        <Button className={'pl-1.5'}>
          <RiAddLine />
          New Document
        </Button>
      </CreateDocumentDialog>

      <InputGroup className={'dark:bg-background min-w-48 flex-1'}>
        <InputGroupAddon>
          <RiSearchLine />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search by name..." />
      </InputGroup>

      <Combobox>
        <ComboboxInput
          className={'dark:bg-background w-full sm:w-75'}
          placeholder={'Sort: Newest'}
        />

        <ComboboxContent></ComboboxContent>
      </Combobox>
    </Card>
  );
};

export default DocumentsToolbar;
