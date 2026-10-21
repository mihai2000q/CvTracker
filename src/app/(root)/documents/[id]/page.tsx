import type { Metadata } from 'next';
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
import LocalDateTime from '@/components/date/local-date-time.tsx';
import DocumentThumbnail from '@/features/documents/components/document-thumbnail.tsx';
import DocumentTypeBadge from '@/features/documents/components/document-type-badge.tsx';
import DocumentJobApplicationsSection from '@/features/documents/components/document-job-applications-section.tsx';
import { DOCUMENT_JOB_APPLICATIONS_PAGE_SIZE } from '@/features/documents/constants/document-page.ts';
import { getDocument } from '@/features/documents/queries/get-document.ts';
import { getJobApplicationSummaries } from '@/features/job-applications/queries/get-job-application-summaries.ts';

export async function generateMetadata({
  params,
}: PageProps<'/documents/[id]'>): Promise<Metadata> {
  const { id } = await params;
  // Queries are cached, so the page reuses this lookup. A missing entity gets the page's notFound()
  const result = await getDocument(id);
  if (!result.success || !result.data) {
    return {};
  }
  const data = result.data;
  return { title: data.name };
}

const DocumentPage = async ({ params }: PageProps<'/documents/[id]'>) => {
  const { id } = await params;

  const [documentResult, jobApplicationsResult] = await Promise.all([
    getDocument(id),
    getJobApplicationSummaries({ documentId: id, pageSize: DOCUMENT_JOB_APPLICATIONS_PAGE_SIZE }),
  ]);
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
              <span>
                Uploaded <LocalDateTime date={document.uploadedAt} pattern={'dd MMM, yyyy'} />
              </span>
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

        <div className={'min-w-0'}>
          <DocumentJobApplicationsSection
            documentId={document.id}
            initialJobApplications={jobApplications}
            totalCount={totalCount}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentPage;
