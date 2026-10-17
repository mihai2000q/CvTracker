import React from 'react';
import Link from 'next/link';
import { RiDownload2Line, RiFileFill } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import FileSize from '@/components/file-size.tsx';
import DocumentTypeBadge from '@/features/documents/components/document-type-badge.tsx';
import { DocumentSummary } from '@/features/documents/types/document.ts';

const DocumentRow = ({ document }: { document: DocumentSummary }) => (
  <div className={'flex items-center gap-3'}>
    <RiFileFill
      data-document-type={document.type}
      className={'size-8 shrink-0 text-(--document-color)'}
    />
    <div className={'flex min-w-0 flex-1 flex-col gap-0.5'}>
      <Link
        href={`/documents/${document.id}`}
        prefetch={false}
        title={document.name}
        className={'link-underline w-fit max-w-full truncate text-sm font-medium'}
      >
        {document.name}
      </Link>
      <div className={'text-muted-foreground flex items-center gap-1.5 text-xs'}>
        <DocumentTypeBadge type={document.type} className={'px-1.5 py-0 text-[0.625rem]'} />
        <FileSize bytes={document.size} />
      </div>
    </div>
    <Button
      variant={'ghost'}
      size={'icon-sm'}
      aria-label={`Download ${document.name}`}
      title={'Download'}
      nativeButton={false}
      render={<a href={`/api/documents/${document.id}/download`} download />}
    >
      <RiDownload2Line />
    </Button>
  </div>
);

interface Props {
  cv: DocumentSummary;
  coverLetter?: DocumentSummary | null;
}

const JobApplicationDocumentsCard = ({ cv, coverLetter }: Props) => (
  <Card className={'gap-3 p-5'}>
    <h2 className={'text-muted-foreground text-[0.70rem] font-bold uppercase'}>Documents</h2>
    <div className={'flex flex-col gap-3'}>
      <DocumentRow document={cv} />
      {coverLetter ? (
        <DocumentRow document={coverLetter} />
      ) : (
        <p className={'text-muted-foreground text-sm italic'}>No cover letter</p>
      )}
    </div>
  </Card>
);

export default JobApplicationDocumentsCard;
