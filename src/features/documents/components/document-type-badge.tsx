import React from 'react';
import { Badge } from '@/components/ui/badge.tsx';
import { cn } from '@/lib/utils.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';

const LABELS: Record<DocumentType, string> = {
  [DocumentType.CV]: 'CV / Resume',
  [DocumentType.CoverLetter]: 'Cover Letter',
};

interface Props {
  type: DocumentType;
  className?: string;
}

const DocumentTypeBadge = ({ type, className }: Props) => {
  return (
    <Badge
      variant={'outline'}
      data-document-type={type}
      className={cn(
        'rounded-md',
        'border-(--document-color)/30 bg-(--document-color)/12',
        'text-[oklch(from_var(--document-color)_calc(l+0.2)_c_h)]',
        className
      )}
    >
      {LABELS[type]}
    </Badge>
  );
};

export default DocumentTypeBadge;
