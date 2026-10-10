'use client';

import { type ComponentProps, type DragEvent, useState } from 'react';
import { RiUploadCloud2Line } from '@remixicon/react';
import { cn } from 'cn';

interface Props extends Omit<ComponentProps<'div'>, 'onDrop'> {
  // Same format as the `<input accept>` attribute; used to colour the drag state.
  accept?: string;
  // Short helper line under the call to action, e.g. "PDF or Word, up to 10 MB".
  hint?: string;
  invalid?: boolean;
  onFileDrop: (file: File) => void;
  onBrowse: () => void;
}

type DragState = 'idle' | 'accept' | 'reject';

// The empty-state drop target: a dashed area that highlights green/red while
// a file is dragged over it and reports the dropped file. It holds no file
// or form state - whatever uses it owns the input and decides what to show
// once a file is chosen.
const FileDropzone = ({
  accept,
  hint,
  invalid,
  onFileDrop,
  onBrowse,
  className,
  ...props
}: Props) => {
  const [dragState, setDragState] = useState<DragState>('idle');

  // While dragging, browsers expose each item's MIME type but not its name or
  // size, so only the type can be judged here. A file dropped anyway is still
  // reported, and the form's validation produces the real error message.
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const type = event.dataTransfer.items[0]?.type;
    setDragState(type === undefined || isAcceptedType(type, accept) ? 'accept' : 'reject');
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    // Ignore the leave events fired when moving between our own children.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragState('idle');
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragState('idle');
    const dropped = event.dataTransfer.files[0];
    if (dropped) onFileDrop(dropped);
  };

  return (
    <div
      {...props}
      data-slot="file-dropzone"
      data-drag={dragState}
      aria-invalid={invalid}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'group/dropzone border-input bg-muted/30 relative rounded-lg border border-dashed transition-colors',
        'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-3',
        'aria-invalid:border-destructive aria-invalid:bg-destructive/10',
        'hover:border-muted-foreground/70 hover:bg-muted/70',
        'data-[drag=accept]:border-green-500 data-[drag=accept]:bg-green-500/10',
        'data-[drag=reject]:border-destructive data-[drag=reject]:bg-destructive/10',
        className
      )}
    >
      <button
        type="button"
        onClick={onBrowse}
        className="flex w-full cursor-pointer flex-col items-center gap-1 rounded-lg p-6 text-center outline-none"
      >
        <RiUploadCloud2Line
          className={cn(
            'text-muted-foreground size-8',
            'group-aria-invalid/dropzone:text-destructive',
            'group-data-[drag=accept]/dropzone:text-green-600',
            'group-data-[drag=reject]/dropzone:text-destructive'
          )}
        />
        <span>
          Drag a file here, or <span className="underline">browse</span>
        </span>
        {hint && <span className="text-muted-foreground text-xs">{hint}</span>}
      </button>
    </div>
  );
};

// Mirrors the `accept` attribute: MIME types (`application/pdf`), wildcards
// (`image/*`) and extensions (`.pdf`). Extensions can't be checked from a
// bare MIME type, so a list that only has extensions lets everything through.
function isAcceptedType(type: string, accept?: string): boolean {
  if (!accept) return true;
  const tokens = accept.split(',').map((token) => token.trim().toLowerCase());
  const mimeTokens = tokens.filter((token) => token.includes('/'));
  if (mimeTokens.length < tokens.length && type === '') return true;
  if (mimeTokens.length === 0) return true;
  const lowerType = type.toLowerCase();
  return mimeTokens.some((token) =>
    token.endsWith('/*') ? lowerType.startsWith(token.slice(0, -1)) : lowerType === token
  );
}

export default FileDropzone;
