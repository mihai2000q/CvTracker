'use client';

import React from 'react';
import { RiArrowDownSLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import { toast } from '@/components/ui/toast.tsx';
import { usePagedItems } from '@/hooks/use-paged-items.ts';
import { fetchJson } from '@/lib/http/fetch-json.ts';
import { buildSearchParams } from '@/lib/http/url-search-params.ts';
import { Page } from '@/lib/pagination.ts';
import DocumentJobApplicationItem from '@/features/documents/components/document-job-application-item.tsx';
import { DOCUMENT_JOB_APPLICATIONS_PAGE_SIZE } from '@/features/documents/constants/document-page.ts';
import type { JobApplicationSummary } from '@/features/job-applications/types/job-application-summary.ts';

interface Props {
  documentId: string;
  initialJobApplications: JobApplicationSummary[];
  totalCount: number;
}

const DocumentJobApplicationsList = ({ documentId, initialJobApplications, totalCount }: Props) => {
  const { items, hasMore, isPending, loadMore } = usePagedItems({
    initialItems: initialJobApplications,
    totalCount,
    loadPage: async (page) =>
      (
        await fetchJson<Page<JobApplicationSummary>>(
          `/api/job-applications/summaries?${buildSearchParams({ documentId, page, pageSize: DOCUMENT_JOB_APPLICATIONS_PAGE_SIZE })}`
        )
      ).items,
    onError: () =>
      toast.add({ type: 'error', title: 'Could not load more', description: 'Please try again' }),
  });

  return (
    <>
      <ul role="list" className={'grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-3'}>
        {items.map((jobApplication) => (
          <li key={jobApplication.id}>
            <DocumentJobApplicationItem jobApplication={jobApplication} />
          </li>
        ))}
      </ul>

      <div className={'mt-3 flex flex-wrap items-center justify-between gap-2 max-sm:flex-col'}>
        <div className={'text-muted-foreground text-xs'}>
          Displaying {items.length} of {totalCount} applications
        </div>
        {hasMore && (
          <Button variant={'ghost'} size={'sm'} loading={isPending} onClick={loadMore}>
            Show {Math.min(DOCUMENT_JOB_APPLICATIONS_PAGE_SIZE, totalCount - items.length)} more
            <RiArrowDownSLine />
          </Button>
        )}
      </div>
    </>
  );
};

export default DocumentJobApplicationsList;
