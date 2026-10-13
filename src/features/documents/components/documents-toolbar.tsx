import React from 'react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx';
import { RiAddLine, RiSearchLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import CreateDocumentDialog from '@/features/documents/components/create-document-dialog.tsx';
import { Card } from '@/components/ui/card.tsx';
import SortCombobox from '@/components/sort/sort-combobox.tsx';
import { buildSortOptions, SortEntry } from '@/lib/sort.ts';
import {
  DOCUMENT_SORT_PRESETS,
  DocumentSortField,
} from '@/features/documents/constants/documents-sorting.tsx';

interface Props {
  sortBy: string[];
  hrefForSortBy: (sortBy: SortEntry<DocumentSortField>[]) => string;
}

const DocumentsToolbar = ({ sortBy, hrefForSortBy }: Props) => {
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

      <SortCombobox
        options={buildSortOptions(DOCUMENT_SORT_PRESETS, sortBy, hrefForSortBy)}
        inputProps={{
          className: 'dark:bg-background min-w-50 sm:w-[20%]',
          placeholder: 'Sort documents by...',
        }}
      />
    </Card>
  );
};

export default DocumentsToolbar;
