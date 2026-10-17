'use client';

import React, { useRef, useState } from 'react';
import { getInputProps } from '@conform-to/react';
import { useQueryClient } from '@tanstack/react-query';
import { RiCloseLine, RiFileTextLine, RiUploadLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment.tsx';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldDescription, FieldGroup } from '@/components/ui/field.tsx';
import FormField from '@/components/form/form-field.tsx';
import FieldControl from '@/components/form/field-control.tsx';
import FileSize from '@/components/file-size.tsx';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group.tsx';
import { useFormDialog } from '@/hooks/use-form-dialog.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import { ALLOWED_FILE_TYPES } from '@/lib/zod/fields.ts';
import { updateDocument } from '@/features/documents/actions/update-document.ts';
import {
  UpdateDocumentForm,
  updateDocumentSchema,
} from '@/features/documents/schemas/update-document-schema.ts';
import { Document } from '@/features/documents/types/document.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';

interface Props {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditDocumentDialog = ({ document, open, onOpenChange }: Props) => {
  const queryClient = useQueryClient();
  const { dialogProps, contentProps, reset, resetKey, form, fields, isPending } =
    useFormDialog<UpdateDocumentForm>({
      action: updateDocument,
      schema: updateDocumentSchema,
      defaultValue: {
        id: document.id,
        type: document.type,
        name: document.name,
        notes: document.notes ?? undefined,
      },
      open,
      onOpenChange,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.documents }),
    });
  const isUsed = document.jobApplicationsCount > 0;

  return (
    <Dialog {...dialogProps}>
      <DialogContent {...contentProps} className="px-0 md:max-w-sm">
        <form id={form.id} onSubmit={form.onSubmit} noValidate>
          <input {...getInputProps(fields.id, { type: 'hidden' })} />

          <DialogHeader className={'mb-4 px-6'}>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Change the details of this document, or replace its file.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea>
            <FieldGroup key={resetKey} className={'max-h-[60vh] px-6'}>
              <FormField field={fields.name} label="Name" required>
                <Input {...getInputProps(fields.name, { type: 'text' })} maxLength={150} />
              </FormField>

              <FormField field={fields.type} label="Type" required>
                <FieldControl<DocumentType> form={form} field={fields.type}>
                  {(type) => (
                    <ToggleGroup
                      size={'sm'}
                      spacing={0}
                      disabled={isUsed}
                      className={'bg-secondary/80 rounded-lg'}
                      value={type.value ? [type.value] : []}
                      onValueChange={(next) => next[0] && type.change(next[0] as DocumentType)}
                      onBlur={type.blur}
                    >
                      <ToggleGroupItem
                        value={DocumentType.CV}
                        data-document-type={DocumentType.CV}
                        className={
                          'flex-1 rounded-lg transition-colors duration-125 aria-pressed:bg-(--document-color)/90 aria-pressed:text-(--document-color-foreground)'
                        }
                      >
                        CV / Resume
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value={DocumentType.CoverLetter}
                        data-document-type={DocumentType.CoverLetter}
                        className={
                          'flex-1 rounded-lg transition-colors duration-125 aria-pressed:bg-(--document-color)/85 aria-pressed:text-(--document-color-foreground)'
                        }
                      >
                        Cover Letter
                      </ToggleGroupItem>
                    </ToggleGroup>
                  )}
                </FieldControl>
                {isUsed && (
                  <FieldDescription>
                    Used by {document.jobApplicationsCount}{' '}
                    {document.jobApplicationsCount === 1 ? 'job' : 'jobs'}, so its type cannot
                    change
                  </FieldDescription>
                )}
              </FormField>

              <FormField field={fields.file} label="File">
                <DocumentFileInput
                  inputProps={getInputProps(fields.file, { type: 'file' })}
                  current={document}
                />
              </FormField>

              <FormField field={fields.notes} className={'pb-4'} label="Notes">
                <Textarea
                  placeholder={'Add any extra content...'}
                  {...getInputProps(fields.notes, { type: 'text' })}
                  className={'max-h-32'}
                />
              </FormField>
            </FieldGroup>
          </ScrollArea>

          <DialogFooter className={'sm:flex-col'}>
            <Separator />
            <div className={'flex gap-2 pt-2'}>
              <DialogClose onClick={reset} render={<Button variant="outline">Cancel</Button>} />
              <Button type="submit" loading={isPending}>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface DocumentFileInputProps {
  inputProps: Omit<React.ComponentProps<'input'>, 'value' | 'defaultValue'>;
  current: Pick<Document, 'originalFilename' | 'size'>;
}

// The file the document has, as an attachment; picking another one shows that instead, and
// removing it goes back to the current one. Nothing picked keeps the current file.
const DocumentFileInput = ({ inputProps, current }: DocumentFileInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<File | null>(null);

  function clearPicked() {
    const input = inputRef.current;
    if (!input) return;
    input.files = new DataTransfer().files;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  return (
    <>
      <input
        {...inputProps}
        ref={inputRef}
        type="file"
        accept={ALLOWED_FILE_TYPES.join(',')}
        className="sr-only"
        onChange={(event) => setPicked(event.currentTarget.files?.[0] ?? null)}
      />

      <Attachment className="w-full">
        <AttachmentMedia>
          <RiFileTextLine />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>{picked?.name ?? current.originalFilename}</AttachmentTitle>
          <AttachmentDescription>
            {picked && <>New file • </>}
            <FileSize bytes={picked?.size ?? current.size} />
          </AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          {picked ? (
            <AttachmentAction aria-label="Keep the current file" onClick={clearPicked}>
              <RiCloseLine />
            </AttachmentAction>
          ) : (
            <AttachmentAction
              aria-label="Replace the file"
              title="Replace the file"
              onClick={() => inputRef.current?.click()}
            >
              <RiUploadLine />
            </AttachmentAction>
          )}
        </AttachmentActions>
      </Attachment>
    </>
  );
};

export default EditDocumentDialog;
