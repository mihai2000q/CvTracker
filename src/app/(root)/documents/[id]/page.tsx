import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx';
import DocumentActions from '@/features/documents/components/document-actions.tsx';
import { Card } from '@/components/ui/card.tsx';
import FileSize from '@/components/file-size.tsx';
import DocumentThumbnail from '@/features/documents/components/document-thumbnail.tsx';
import DocumentTypeBadge from '@/features/documents/components/document-type-badge.tsx';
import DocumentJobApplicationsList from '@/features/documents/components/document-job-applications-list.tsx';
import { DOCUMENT_JOB_APPLICATIONS_PAGE_SIZE } from '@/features/documents/constants/document-page.ts';
import { getDocument } from '@/features/documents/queries/get-document.ts';
import { getJobApplicationSummaries } from '@/features/job-applications/queries/get-job-application-summaries.ts';

const DocumentPage = async ({ params }: PageProps<'/documents/[id]'>) => {
  const { id } = await params;

  // The applications are the first page of them, and "Show more" loads the rest from the browser
  const [documentResult, jobApplicationsResult] = await Promise.all([
    getDocument(id),
    getJobApplicationSummaries({ documentId: id, pageSize: DOCUMENT_JOB_APPLICATIONS_PAGE_SIZE }),
  ]);
  // An id that isn't one is as missing as one that matches no document
  if (!documentResult.success || !documentResult.data) {
    notFound();
  }
  if (!jobApplicationsResult.success) {
    redirect('/documents');
  }

  const document = documentResult.data;
  const { items: jobApplications, totalCount } = jobApplicationsResult.data;

  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={'/documents'} />}>Documents</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{document.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className={'grid flex-1 items-start gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]'}>
        <Card className={'items-center gap-4 px-5 text-center lg:sticky lg:top-6'}>
          <DocumentThumbnail originalFilename={document.originalFilename} className={'w-28'} />

          <div className={'flex w-full min-w-0 flex-col items-center gap-2'}>
            <h1 className={'w-full text-2xl leading-tight font-bold break-words'}>
              {document.name}
            </h1>
            <div
              title={document.originalFilename}
              className={'text-muted-foreground w-full truncate text-sm'}
            >
              {document.originalFilename}
            </div>
            <div className={'text-muted-foreground flex items-center gap-1.5 text-xs'}>
              <FileSize bytes={document.size} />
              <span aria-hidden>•</span>
              <span>Uploaded {new Date(document.uploadedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <DocumentTypeBadge type={document.type} className={'h-7 px-2.5'} />

          {document.notes && (
            <p className={'text-muted-foreground w-full text-left text-sm whitespace-pre-line'}>
              {document.notes}
            </p>
          )}
          <DocumentActions document={document} />
        </Card>

        <main className={'flex min-w-0 flex-col gap-3'}>
          <div className={'flex items-baseline gap-1.5'}>
            <h2 className={'text-lg font-semibold'}>Used on</h2>
            <span className={'text-muted-foreground text-sm tabular-nums'}>{totalCount}</span>
          </div>

          {totalCount > 0 ? (
            <DocumentJobApplicationsList
              documentId={document.id}
              initialJobApplications={jobApplications}
              totalCount={totalCount}
            />
          ) : (
            <div
              className={
                'text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm'
              }
            >
              This document hasn&apos;t been used on a job application yet
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DocumentPage;
