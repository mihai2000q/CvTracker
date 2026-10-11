import { Separator } from '@/components/ui/separator.tsx';
import { readSearchParams } from '@/lib/search-params.ts';
import { redirect } from 'next/navigation';
import { getDocuments } from '@/features/documents/queries/get-documents.ts';
import AppPagination from '@/components/pagination/app-pagination.tsx';
import DocumentItem from '@/features/documents/components/document-item.tsx';
import { documentsSearchParamsState } from '@/features/documents/schemas/documents-search-params.ts';
import EmptyDocuments from '@/features/documents/components/empty-documents.tsx';
import DocumentsToolbar from '@/features/documents/components/documents-toolbar.tsx';
import { SegmentedControl } from '@/components/ui/segmented-control.tsx';

const Documents = async ({ searchParams }: PageProps<'/documents'>) => {
  const {
    values: { page },
    hrefFor,
  } = readSearchParams(documentsSearchParamsState, await searchParams);
  const hrefForPage = (page: number) => hrefFor('/documents', { page });

  const result = await getDocuments({ page });
  if (!result.success) {
    redirect('/documents');
  }

  const { items: documents, totalCount } = result.data;

  return (
    <div className={'flex flex-1 flex-col'}>
      <header className={'flex flex-wrap items-center justify-between gap-3'}>
        <div className={'flex flex-col'}>
          <h1 className={'text-2xl font-bold'}>Documents</h1>
          <div className={'text-muted-foreground text-xs'}>Manage your CVs and Cover Letters</div>
        </div>

        {totalCount > 0 && (
          <SegmentedControl
            aria-label="Document type"
            items={[
              { label: 'All', href: '/documents', active: true, count: totalCount },
              { label: 'CVs', href: '/documents?type=cv', count: 2 },
              { label: 'Cover Letters', href: '/documents?type=cover-letter', count: 3 },
            ]}
          />
        )}
      </header>

      <Separator className={'mt-4 mb-3'} />

      <main className={'flex flex-1 flex-col gap-4'}>
        {totalCount > 0 && <DocumentsToolbar />}

        {totalCount > 0 && (
          <ul role="list" className={'grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4'}>
            {documents.map((document) => (
              <li key={document.id}>
                <DocumentItem document={document} />
              </li>
            ))}
          </ul>
        )}

        {totalCount === 0 && <EmptyDocuments />}
      </main>

      {totalCount > 0 && (
        <div className={'flex flex-wrap items-center justify-between gap-2 pt-4'}>
          <div className={'text-muted-foreground text-xs'}>
            Displaying {documents.length} of {totalCount} documents
          </div>

          <AppPagination page={page} totalCount={totalCount} hrefForPage={hrefForPage} />
        </div>
      )}
    </div>
  );
};

export default Documents;
