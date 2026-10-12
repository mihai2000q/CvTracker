import React from 'react';
import Link from 'next/link';
import { Card, CardFooter } from '@/components/ui/card.tsx';
import { Document } from '@/features/documents/types/document.ts';
import { RiDownload2Line } from '@remixicon/react';
import DocumentThumbnail from '@/features/documents/components/document-thumbnail.tsx';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';
import FileSize from '@/components/file-size.tsx';
import DocumentTypeBadge from '@/features/documents/components/document-type-badge.tsx';

interface Props {
  document: Document;
}

const DocumentItem = ({ document }: Props) => {
  return (
    <Card
      className={cn(
        'relative h-full px-4 py-6',
        'hover:bg-muted hover:border-muted-foreground/50 transition-colors duration-125',
        'has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-2'
      )}
    >
      <div className={'flex flex-col items-center gap-3'}>
        <DocumentThumbnail originalFilename={document.originalFilename} className={'w-1/2'} />

        <div className={'flex w-full min-w-0 flex-col items-center gap-0.5'}>
          <Link
            href={`/documents/${document.id}`}
            prefetch={false}
            title={document.name}
            className={
              'w-full truncate text-center text-lg font-bold outline-none after:absolute after:inset-0'
            }
          >
            {document.name}
          </Link>
          <div
            title={document.originalFilename}
            className={'text-muted-foreground w-full truncate text-center text-xs'}
          >
            {document.originalFilename}
          </div>
          <div className={'text-muted-foreground/70 flex items-center gap-1.5 text-xs'}>
            <FileSize bytes={document.size} />
            <span aria-hidden>•</span>
            {document.jobApplicationsCount} {document.jobApplicationsCount === 1 ? 'job' : 'jobs'}
          </div>
        </div>
      </div>

      <CardFooter className={'justify-center gap-2'}>
        <DocumentTypeBadge type={document.type} className={'h-7 px-2.5'} />
        <Button
          variant={'secondary'}
          size={'sm'}
          className={'relative z-10 text-xs'}
          nativeButton={false}
          render={<a href={`/api/documents/${document.id}/download`} download />}
        >
          <RiDownload2Line />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentItem;
