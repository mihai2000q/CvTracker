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
import { FieldGroup } from '@/components/ui/field.tsx';
import FormField from '@/components/form/form-field.tsx';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { detectSourceFromUrl } from '@/features/job-applications/constants/job-sources.ts';
import { getInputProps } from '@conform-to/react';
import FieldControl from '@/components/form/field-control.tsx';
import { createJobApplication } from '@/features/job-applications/actions/create-job-application.ts';
import {
  CreateJobApplicationForm,
  createJobApplicationSchema,
} from '@/features/job-applications/schemas/create-job-application-schema.ts';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useFormDialog } from '@/hooks/use-form-dialog.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import OrganizationCountrySection from '@/features/job-applications/components/organization-country-section.tsx';
import { OrganizationSummary } from '@/features/organizations/types/organization.ts';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import DateInput from '@/components/form/date-input.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx';
import { RiLink } from '@remixicon/react';
import { Textarea } from '@/components/ui/textarea.tsx';
import DocumentPicker from '@/features/job-applications/components/document-picker.tsx';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';
import SourceGroup from '@/features/job-applications/components/source/source-group.tsx';
import { Separator } from '@/components/ui/separator.tsx';

const schema = createJobApplicationSchema(() => format(new Date(), 'yyyy-MM-dd'));

interface Props {
  // Opens the dialog; leave it out when the dialog is opened from somewhere else
  children?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  organization?: OrganizationSummary;
}

const CreateJobApplicationDialog = ({ children, open, onOpenChange, organization }: Props) => {
  const initialCountry = organization?.countries[0] ?? null;
  const queryClient = useQueryClient();
  const { dialogProps, contentProps, reset, resetKey, form, fields, isPending } =
    useFormDialog<CreateJobApplicationForm>({
      action: createJobApplication,
      schema,
      open,
      onOpenChange,
      defaultValue: organization
        ? { organizationName: organization.name, countryId: initialCountry?.id }
        : undefined,
      deps: { cvDocumentFile: ['cvDocumentId'] },
      onSuccess: async (formData) => {
        const isUploaded = (name: string) => {
          const file = formData.get(name);
          return file instanceof File && file.size > 0;
        };
        if (!formData.get('organizationId')) {
          await queryClient.invalidateQueries({ queryKey: queryKeys.organizations });
        }
        if (isUploaded('cvDocumentFile') || isUploaded('coverLetterDocumentFile')) {
          await queryClient.invalidateQueries({ queryKey: queryKeys.documents });
        }
      },
    });

  // Tied to resetKey so a URL typed before a reset doesn't suggest a source in the fresh form
  const [postingUrl, setPostingUrl] = useState({ url: '', resetKey });
  const suggestedSource =
    postingUrl.resetKey === resetKey ? detectSourceFromUrl(postingUrl.url) : undefined;

  return (
    <Dialog {...dialogProps}>
      {children && <DialogTrigger render={children} />}
      <DialogContent {...contentProps} className="px-0 md:max-w-lg">
        <form id={form.id} onSubmit={form.onSubmit} noValidate>
          <DialogHeader className={'mb-4 px-6'}>
            <DialogTitle>New Job Application</DialogTitle>
            <DialogDescription>
              Record a job you&#39;ve applied to. Fill in what you know, save and edit later.
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <ScrollArea>
            <FieldGroup key={resetKey} className={'max-h-[55vh] px-6 pt-4'}>
              <FormField field={fields.title} label="Name" required>
                <Input
                  {...getInputProps(fields.title, { type: 'text' })}
                  placeholder="e.g. Software Engineer"
                  maxLength={200}
                />
              </FormField>

              <OrganizationCountrySection form={form} fields={fields} organization={organization} />

              <div className={'flex gap-4'}>
                <FormField field={fields.postingUrl} label="Posting URL">
                  <InputGroup className={'w-auto'}>
                    <InputGroupAddon>
                      <RiLink />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...getInputProps(fields.postingUrl, { type: 'text' })}
                      onChange={(event) =>
                        setPostingUrl({ url: event.target.value, resetKey })
                      }
                      placeholder="https://"
                    />
                  </InputGroup>
                </FormField>

                <FormField field={fields.appliedAt} label="Applied Date" required>
                  <FieldControl form={form} field={fields.appliedAt}>
                    {(appliedAt) => (
                      <DateInput
                        {...appliedAt}
                        id={fields.appliedAt.id}
                        invalid={!fields.appliedAt.valid}
                        disable={'future'}
                      />
                    )}
                  </FieldControl>
                </FormField>
              </div>

              <FormField field={fields.source} label="Source">
                <FieldControl form={form} field={fields.source}>
                  {(source) => <SourceGroup {...source} suggested={suggestedSource} />}
                </FieldControl>
              </FormField>

              <div className={'grid grid-cols-2 gap-4'}>
                <FormField field={fields.cvDocumentId} label="CV / Resume" required>
                  <FieldControl form={form} field={fields.cvDocumentId}>
                    {(cvId) => (
                      <DocumentPicker
                        {...getInputProps(fields.cvDocumentFile, { type: 'file' })}
                        documentType={DocumentType.CV}
                        selectorProps={{
                          ...cvId,
                          id: fields.cvDocumentId.id,
                          invalid: !fields.cvDocumentId.valid,
                        }}
                      />
                    )}
                  </FieldControl>
                </FormField>

                <FormField field={fields.coverLetterDocumentId} label="Cover Letter">
                  <FieldControl form={form} field={fields.coverLetterDocumentId}>
                    {(coverLetterId) => (
                      <DocumentPicker
                        {...getInputProps(fields.coverLetterDocumentFile, { type: 'file' })}
                        documentType={DocumentType.CoverLetter}
                        selectorProps={{
                          ...coverLetterId,
                          id: fields.coverLetterDocumentId.id,
                          invalid: !fields.coverLetterDocumentId.valid,
                          inputProps: { showClear: true },
                        }}
                      />
                    )}
                  </FieldControl>
                </FormField>
              </div>

              <FormField field={fields.notes} className={'pb-6'} label="Notes">
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
                Save changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobApplicationDialog;
