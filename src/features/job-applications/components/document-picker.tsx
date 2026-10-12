import React, { type ComponentProps, useRef, useState } from 'react';
import {
  Attachment,
  AttachmentAction,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment.tsx';
import { RiCloseLine, RiFileTextLine } from '@remixicon/react';
import FileDropzone from '@/components/form/file-dropzone.tsx';
import DocumentCombobox from '@/components/combobox/document-combobox.tsx';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';
import { ALLOWED_FILE_TYPES } from '@/lib/zod/fields.ts';
import FileSize from '@/components/file-size.tsx';
import { ComboboxInputProps } from '@/components/ui/combobox.tsx';

interface Props extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultValue'> {
  documentType: DocumentType;
  selectorProps: {
    change: (id: string) => void;
    blur?: () => void;
    id?: string;
    invalid?: boolean;
    inputProps?: ComboboxInputProps;
  };
  hint?: string;
}

const DocumentPicker = ({
  documentType,
  selectorProps,
  onChange,
  hint = 'PDF or Word document (10 MB)',
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
    <div className={'flex justify-center'}>
      <input
        {...inputProps}
        accept={accept}
        ref={inputRef}
        type="file"
        className="sr-only"
        onChange={(event) => {
          setFile(event.currentTarget.files?.[0] ?? null);
          // A file and a picked document are alternatives; the form must never hold both
          selectorProps.change('');
          onChange?.(event);
        }}
      />

      {file ? (
        <Attachment orientation={'vertical'} className="min-w-full">
          <AttachmentMedia className={'max-h-28 max-w-28 self-center'}>
            <RiFileTextLine className={'size-14'} />
            <AttachmentAction
              className={'absolute top-2.5 right-2.5 size-2.5'}
              aria-label="Remove file"
              onClick={() => setInputFile(null)}
            >
              <RiCloseLine />
            </AttachmentAction>
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{file.name}</AttachmentTitle>
            <AttachmentDescription>
              <FileSize bytes={file.size} />
            </AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ) : (
        <div className={'flex flex-col items-center gap-2.5'}>
          <DocumentCombobox documentType={documentType} {...selectorProps} />

          <FileDropzone
            accept={accept}
            hint={hint}
            invalid={
              selectorProps.invalid ||
              inputProps['aria-invalid'] === true ||
              inputProps['aria-invalid'] === 'true'
            }
            onFileDrop={setInputFile}
            onBrowse={() => inputRef.current?.click()}
          />
        </div>
      )}
    </div>
  );
};

export default DocumentPicker;
