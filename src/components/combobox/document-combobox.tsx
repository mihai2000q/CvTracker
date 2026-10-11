'use client';

import { queryKeys } from '@/lib/query-keys.ts';
import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useHasLoadedOnce } from '@/hooks/use-has-loaded-once';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxInputProps,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from '@/components/ui/combobox.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { InputGroupAddon } from '@/components/ui/input-group.tsx';
import { RiFileTextLine } from '@remixicon/react';
import { fetchJson } from '@/lib/http/fetch-json.ts';
import { buildSearchParams } from '@/lib/http/url-search-params.ts';
import { DocumentSummary } from '@/features/documents/types/document.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';

interface Props {
  documentType: DocumentType;
  change: (id: string) => void;
  blur?: () => void;
  id?: string;
  invalid?: boolean;
  inputProps?: ComboboxInputProps;
}

const DocumentCombobox = ({ documentType, change, blur, id, invalid, inputProps }: Props) => {
  const [selectedDocument, setSelectedDocument] = useState<DocumentSummary | null>(null);
  const handleValueChange = (next: DocumentSummary | null) => {
    setSelectedDocument(next);
    change(next?.id ?? '');
  };

  const anchor = useComboboxAnchor();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: queryKeys.documentSearch(documentType, debouncedSearch),
    queryFn: async ({ pageParam }) =>
      fetchJson<{ items: DocumentSummary[]; nextCursor: string | null }>(
        `/api/documents/search?${buildSearchParams({ search: debouncedSearch, cursor: pageParam, type: documentType })}`
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const documents = data?.pages.flatMap((p) => p.items) ?? [];

  const hasLoaded = useHasLoadedOnce(data);
  // Nothing to pick from at all, as opposed to a search that found nothing
  const hasNoDocuments =
    hasLoaded && search === '' && debouncedSearch === '' && documents.length === 0;
  const isCv = documentType === DocumentType.CV;
  const isDisabled = !hasLoaded || hasNoDocuments;

  const handleScroll = async (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget;
    if (hasNextPage && scrollHeight - scrollTop - clientHeight < 48) {
      await fetchNextPage();
    }
  };

  return (
    <Combobox
      disabled={isDisabled}
      value={selectedDocument}
      onValueChange={handleValueChange}
      itemToStringLabel={(document) => document.name}
      isItemEqualToValue={(a, b) => a.id === b.id}
      inputValue={search}
      onInputValueChange={setSearch}
    >
      <ComboboxInput
        anchorRef={anchor}
        id={id}
        aria-invalid={invalid && !isDisabled ? true : undefined}
        placeholder={
          hasNoDocuments
            ? isCv
              ? 'No CVs available'
              : 'No letters available'
            : isCv
              ? 'Select CV / Resume...'
              : 'Select Cover Letter...'
        }
        onBlur={blur}
        disabled={isDisabled}
        {...inputProps}
      >
        <InputGroupAddon>{!hasLoaded ? <Spinner /> : <RiFileTextLine />}</InputGroupAddon>
      </ComboboxInput>

      <ComboboxContent anchor={anchor}>
        <ScrollArea viewportProps={{ onScroll: handleScroll, className: 'max-h-63' }}>
          {hasLoaded && documents.length === 0 && <ComboboxEmpty>No documents found</ComboboxEmpty>}
          <ComboboxList className="max-h-none overflow-visible">
            {documents.map((document) => (
              <ComboboxItem key={document.id} value={document}>
                <span className={'flex min-w-10 flex-col'}>
                  <span className="truncate" title={document.name}>
                    {document.name}
                  </span>
                  <span className={'text-muted-foreground truncate text-[10px]'}>
                    {document.originalFilename}
                  </span>
                </span>
              </ComboboxItem>
            ))}
            {isFetching && <Spinner className={'m-3 justify-self-center'} />}
          </ComboboxList>
        </ScrollArea>
      </ComboboxContent>
    </Combobox>
  );
};

export default DocumentCombobox;
