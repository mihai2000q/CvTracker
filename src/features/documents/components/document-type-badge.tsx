import React from 'react';
import { Badge } from '@/components/ui/badge.tsx';
import { cn } from '@/lib/utils.ts';
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
  type: DocumentType;
  className?: string;
}

const DocumentTypeBadge = ({ type, className }: Props) => {
  const { label, className: colors } = TYPE_BADGES[type];

  return (
    <Badge variant={'outline'} className={cn('rounded-md', colors, className)}>
      {label}
    </Badge>
  );
};

export default DocumentTypeBadge;
