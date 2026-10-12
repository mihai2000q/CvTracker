import React from 'react';
import { RiFilePdf2Fill, RiFileWordFill } from '@remixicon/react';
import { cn } from '@/lib/utils.ts';

interface Props {
  originalFilename: string;
  className?: string;
}

const DocumentThumbnail = ({ originalFilename, className }: Props) => {
  const isPdf = originalFilename.toLowerCase().endsWith('.pdf');

  return (
    <div
      className={cn(
        'grid aspect-[5/6] place-items-center rounded-lg border',
        isPdf ? 'border-red-400/20 bg-red-400/6' : 'border-blue-400/20 bg-blue-400/5',
        className
      )}
    >
      {isPdf ? (
        <RiFilePdf2Fill className={'h-auto w-5/8 text-red-400/80'} />
      ) : (
        <RiFileWordFill className={'h-auto w-5/8 text-blue-400/80'} />
      )}
    </div>
  );
};

export default DocumentThumbnail;
