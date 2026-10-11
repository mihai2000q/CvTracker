'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import React from 'react';
import { getInputProps, useInputControl } from '@conform-to/react';
import { useFormDialog } from '@/hooks/use-form-dialog.ts';
import { Separator } from '@/components/ui/separator.tsx';
import { createDocument } from '@/features/documents/actions/create-document.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import {
  CreateDocumentForm,
  createDocumentSchema,
} from '@/features/documents/schemas/create-document-schema.ts';
import DocumentPicker from '@/features/documents/components/document-picker.tsx';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group.tsx';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { queryKeys } from '@/lib/query-keys.ts';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  children: React.ReactElement;
}

const CreateDocumentDialog = ({ children }: Props) => {
  const queryClient = useQueryClient();
  const { dialogProps, contentProps, reset, form, fields, isPending } =
    useFormDialog<CreateDocumentForm>({
    action: createDocument,
    schema: createDocumentSchema,
    defaultValue: { type: DocumentType.CV },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.documents }),
  });

  const type = useInputControl<DocumentType>({
    key: fields.type.key,
    name: fields.type.name,
    formId: form.id,
    initialValue: fields.type.initialValue as DocumentType,
  });

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file || fields.name.value) return;
    form.update({
      name: fields.name.name,
      value: file.name.replace(/\.[^.]+$/, '').slice(0, 150),
    });
  }

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger render={children} />
      <DialogContent {...contentProps} className="px-0 md:max-w-sm">
        <form id={form.id} onSubmit={form.onSubmit} noValidate>
          <DialogHeader className={'mb-4 px-6'}>
            <DialogTitle>New Document</DialogTitle>
            <DialogDescription>
              Archive a document you want to use later. Fill in the details, save and edit later.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea>
            <FieldGroup className={'max-h-[60vh] px-6'}>
              <Field>
                <FieldLabel htmlFor={fields.name.id} required>
                  Name
                </FieldLabel>
                <Input
                  {...getInputProps(fields.name, { type: 'text' })}
                  placeholder="Cover Letter"
                  maxLength={150}
                />
                <FieldError errors={fields.name.errors} />
              </Field>

              <Field>
                <FieldLabel htmlFor={fields.type.id} required>
                  Type
                </FieldLabel>
                <ToggleGroup
                  size={'sm'}
                  spacing={0}
                  className={'bg-secondary/80 rounded-lg'}
                  value={type.value ? [type.value] : []}
                  onValueChange={(next) => next[0] && type.change(next[0] as DocumentType)}
                  onBlur={type.blur}
                >
                  <ToggleGroupItem
                    value={DocumentType.CV}
                    className={
                      'flex-1 rounded-lg transition-colors duration-125 aria-pressed:bg-amber-600/90 aria-pressed:text-amber-50'
                    }
                  >
                    CV / Resume
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value={DocumentType.CoverLetter}
                    className={
                      'flex-1 rounded-lg transition-colors duration-125 aria-pressed:bg-cyan-700 aria-pressed:text-cyan-50'
                    }
                  >
                    Cover Letter
                  </ToggleGroupItem>
                </ToggleGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor={fields.file.id} required>
                  File
                </FieldLabel>
                <DocumentPicker
                  {...getInputProps(fields.file, { type: 'file' })}
                  onChange={handleFileChange}
                />
                <FieldError errors={fields.file.errors} />
              </Field>

              <Field className={'pb-4'}>
                <FieldLabel htmlFor={fields.notes.id}>Notes</FieldLabel>
                <Textarea
                  placeholder={'Add any extra content...'}
                  {...getInputProps(fields.notes, { type: 'text' })}
                  className={'max-h-32'}
                />
              </Field>
            </FieldGroup>
          </ScrollArea>

          <DialogFooter className={'sm:flex-col'}>
            <Separator />
            <div className={'pt-2 flex gap-2'}>
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

export default CreateDocumentDialog;
