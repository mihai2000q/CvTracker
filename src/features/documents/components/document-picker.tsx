'use client';

import { type ComponentProps, useRef, useState } from 'react';
import { RiCloseLine, RiFileTextLine } from '@remixicon/react';
import FileDropzone from '@/components/form/file-dropzone.tsx';
import FileSize from '@/components/file-size.tsx';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment.tsx';
import { ALLOWED_FILE_TYPES } from '@/lib/zod/fields.ts';

interface Props extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultValue'> {
  hint?: string;
}

const DocumentPicker = ({
  onChange,
  hint = 'PDF or Word document, up to 10 MB',
  accept = ALLOWED_FILE_TYPES.join(','),
  ...inputProps
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const setInputFile = (next: File | null) => {
    const input = inputRef.current;
    if (!input) return;
    const transfer = new DataTransfer();
    if (next) transfer.items.add(next);
    input.files = transfer.files;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  return (
    <div>
      <input
        {...inputProps}
        accept={accept}
        ref={inputRef}
        type="file"
        className="sr-only"
        onChange={(event) => {
          setFile(event.currentTarget.files?.[0] ?? null);
          onChange?.(event);
        }}
      />

      {file ? (
        <Attachment className="w-full">
          <AttachmentMedia>
            <RiFileTextLine />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{file.name}</AttachmentTitle>
            <AttachmentDescription>
              <FileSize bytes={file.size} />
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Remove file" onClick={() => setInputFile(null)}>
              <RiCloseLine />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ) : (
        <FileDropzone
          accept={accept}
          hint={hint}
          invalid={inputProps['aria-invalid'] === true || inputProps['aria-invalid'] === 'true'}
          onFileDrop={setInputFile}
          onBrowse={() => inputRef.current?.click()}
        />
      )}
    </div>
  );
};

export default DocumentPicker;
