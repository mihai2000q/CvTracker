import React from 'react';
import Link from 'next/link';
import { Card, CardFooter } from '@/components/ui/card.tsx';
import { Document } from '@/features/documents/types/document.ts';
import { RiDownload2Line, RiFilePdf2Fill, RiFileWordFill } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';
import { Badge } from '@/components/ui/badge.tsx';
import FileSize from '@/components/file-size.tsx';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';

const TYPE_BADGES: Record<DocumentType, { label: string; className: string }> = {
  [DocumentType.CV]: {
    label: 'CV / Resume',
    className:
      'border-orange-600/30 bg-orange-600/10 text-orange-700 dark:border-orange-400/25 dark:bg-orange-400/10 dark:text-orange-300',
  },
  [DocumentType.CoverLetter]: {
    label: 'Cover Letter',
    className:
      'border-cyan-600/30 bg-cyan-600/10 text-cyan-700 dark:border-cyan-400/25 dark:bg-cyan-400/10 dark:text-cyan-300',
  },
};

interface Props {
  document: Document;
}

const DocumentItem = ({ document }: Props) => {
  const isPdf = document.originalFilename.toLowerCase().endsWith('.pdf');
  const typeBadge = TYPE_BADGES[document.type];

  return (
    <Card
      className={cn(
        'relative h-full px-4 py-6',
        'hover:bg-muted hover:border-muted-foreground/50 transition-colors duration-125',
        'has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-2'
      )}
    >
      <div className={'flex flex-col items-center gap-3'}>
        <div
          className={cn(
            'grid aspect-[5/6] w-1/2 place-items-center rounded-lg border',
            isPdf ? 'border-red-400/20 bg-red-400/6' : 'border-blue-400/20 bg-blue-400/5'
          )}
        >
          {isPdf ? (
            <RiFilePdf2Fill className={'h-auto w-5/8 text-red-400/80'} />
          ) : (
            <RiFileWordFill className={'h-auto w-5/8 text-blue-400/80'} />
          )}
        </div>

        <div className={'flex w-full min-w-0 flex-col items-center gap-0.5'}>
          <Link
            href={`/documents/${document.id}`}
            prefetch={false}
            title={document.name}
            className={'w-full truncate text-center text-lg font-bold outline-none after:absolute after:inset-0'}
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
        <Badge variant={'outline'} className={cn('h-7 rounded-md px-2.5', typeBadge.className)}>
          {typeBadge.label}
        </Badge>
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
