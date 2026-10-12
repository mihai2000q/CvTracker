import React from 'react';
import { format } from 'date-fns';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card.tsx';
import DocumentThumbnail from '@/features/documents/components/document-thumbnail.tsx';
import DocumentTypeBadge from '@/features/documents/components/document-type-badge.tsx';
import FileSize from '@/components/file-size.tsx';
import { DocumentSummary } from '@/features/documents/types/document.ts';

// A card with the document's details, shown when the element it wraps is hovered
const DocumentHoverCard = ({
  document,
  children,
}: {
  document: DocumentSummary;
  children: React.ReactElement;
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger render={children} />
      <HoverCardContent side={'top'} className={'max-w-80'}>
        <div className={'flex items-center gap-4'}>
          <DocumentThumbnail
            originalFilename={document.originalFilename}
            className={'w-18 shrink-0'}
          />

          <div className={'flex min-w-0 flex-1 flex-col gap-0.5'}>
            <div title={document.name} className={'truncate text-base font-bold'}>
              {document.name}
            </div>
            <div
              title={document.originalFilename}
              className={'text-muted-foreground truncate text-xs'}
            >
              {document.originalFilename}
            </div>
            <div className={'text-muted-foreground/70 flex items-center gap-1.5 text-[0.6875rem]'}>
              <FileSize bytes={document.size} />
              <span aria-hidden>•</span>
              {format(document.uploadedAt, 'dd MMM, yyyy')}
            </div>
            <DocumentTypeBadge
              type={document.type}
              className={'mt-1 h-5 px-1.5 text-[0.6875rem]'}
            />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default DocumentHoverCard;
