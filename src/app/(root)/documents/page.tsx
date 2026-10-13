import { readListSearchParams } from '@/lib/search-params.ts';
import { redirect } from 'next/navigation';
import { getDocuments } from '@/features/documents/queries/get-documents.ts';
import { countDocuments } from '@/features/documents/queries/count-documents.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';
import ListHeader from '@/components/list/list-header.tsx';
import ListFooter from '@/components/list/list-footer.tsx';
import DocumentItem from '@/features/documents/components/document-item.tsx';
import { documentsSearchParamsState } from '@/features/documents/schemas/documents-search-params.ts';
import EmptyDocuments from '@/features/documents/components/empty-documents.tsx';
import DocumentsToolbar from '@/features/documents/components/documents-toolbar.tsx';
import NoResults from '@/components/list/no-results.tsx';
import { SegmentedControl } from '@/components/ui/segmented-control.tsx';

const Documents = async ({ searchParams }: PageProps<'/documents'>) => {
  const {
    values: { page, sortBy, filterBy, search },
    hrefForPage,
    hrefForSortBy,
    hrefForNoFilters,
    filterOption,
  } = readListSearchParams(documentsSearchParamsState, '/documents', await searchParams);

  const [result, allCount, cvCount] = await Promise.all([
    getDocuments({ page, sortBy, filterBy, search }),
    countDocuments(),
    countDocuments(DocumentType.CV),
  ]);
  // A document is either a CV or a cover letter, so the rest are cover letters
  const coverLetterCount = allCount - cvCount;
  if (!result.success) {
    redirect('/documents');
  }

  const { items: documents, totalCount } = result.data;
  const typeOption = (type: DocumentType | undefined) => filterOption('type', 'eq', type);

  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <ListHeader
        title="Documents"
        description="Manage your CVs and Cover Letters"
        rightSection={
          allCount > 0 && (
            <SegmentedControl
              aria-label="Document type"
              items={[
                { label: 'All', count: allCount, ...typeOption(undefined) },
                { label: 'CVs', count: cvCount, ...typeOption(DocumentType.CV) },
                {
                  label: 'Cover Letters',
                  count: coverLetterCount,
                  ...typeOption(DocumentType.CoverLetter),
                },
              ]}
            />
          )
        }
      />

      <main className={'flex flex-1 flex-col gap-6'}>
        {allCount > 0 && <DocumentsToolbar sortBy={sortBy} hrefForSortBy={hrefForSortBy} />}

        {totalCount > 0 && (
          <ul role="list" className={'grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4'}>
            {documents.map((document) => (
              <li key={document.id}>
                <DocumentItem document={document} />
              </li>
            ))}
          </ul>
        )}

        {allCount === 0 && <EmptyDocuments />}
        {allCount > 0 && totalCount === 0 && (
          <NoResults noun="documents" clearHref={hrefForNoFilters()} />
        )}
      </main>

      <ListFooter
        shown={documents.length}
        totalCount={totalCount}
        noun="documents"
        page={page}
        hrefForPage={hrefForPage}
      />
    </div>
  );
};

export default Documents;
