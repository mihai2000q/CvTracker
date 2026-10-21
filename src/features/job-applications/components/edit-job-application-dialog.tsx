'use client';

import React from 'react';
import { getInputProps } from '@conform-to/react';
import { RiLink } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { FieldGroup } from '@/components/ui/field.tsx';
import FieldControl from '@/components/form/field-control.tsx';
import FormField from '@/components/form/form-field.tsx';
import DateInput from '@/components/form/date-input.tsx';
import { Input } from '@/components/ui/input.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { useFormDialog } from '@/hooks/use-form-dialog.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';
import DocumentPicker from '@/features/job-applications/components/document-picker.tsx';
import OrganizationCountrySection from '@/features/job-applications/components/organization-country-section.tsx';
import SourceGroup from '@/features/job-applications/components/source/source-group.tsx';
import { updateJobApplication } from '@/features/job-applications/actions/update-job-application.ts';
import {
  UpdateJobApplicationForm,
  updateJobApplicationSchema,
} from '@/features/job-applications/schemas/update-job-application-schema.ts';
import { JobApplication } from '@/features/job-applications/types/job-application.ts';
import { format } from 'date-fns';

interface Props {
  jobApplication: JobApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mount it again (a new `key`) to start over from a job application that changed
const schema = updateJobApplicationSchema(() => format(new Date(), 'yyyy-MM-dd'));

const EditJobApplicationDialog = ({ jobApplication, open, onOpenChange }: Props) => {
  const { dialogProps, contentProps, reset, resetKey, form, fields, isPending } =
    useFormDialog<UpdateJobApplicationForm>({
      action: updateJobApplication,
      schema,
      defaultValue: {
        id: jobApplication.id,
        title: jobApplication.title,
        postingUrl: jobApplication.postingUrl ?? undefined,
        source: jobApplication.source ?? undefined,
        appliedAt: jobApplication.appliedAt,
        notes: jobApplication.notes ?? undefined,
        organizationName: jobApplication.organization.name,
        countryId: jobApplication.country.id,
        cvDocumentId: jobApplication.cv.id,
        coverLetterDocumentId: jobApplication.coverLetter?.id,
      },
      deps: { cvDocumentFile: ['cvDocumentId'] },
      open,
      onOpenChange,
    });

  return (
    <Dialog {...dialogProps}>
      <DialogContent {...contentProps} className="px-0 md:max-w-lg">
        <form id={form.id} onSubmit={form.onSubmit} noValidate>
          <input {...getInputProps(fields.id, { type: 'hidden' })} />

          <DialogHeader className={'mb-4 px-6'}>
            <DialogTitle>Edit Job Application</DialogTitle>
            <DialogDescription>
              Change the details of this job, or replace its documents.
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <ScrollArea>
            <FieldGroup key={resetKey} className={'max-h-[55vh] px-6 pt-4'}>
              <FormField field={fields.title} label="Title" required>
                <Input {...getInputProps(fields.title, { type: 'text' })} maxLength={200} />
              </FormField>

              <OrganizationCountrySection
                form={form}
                fields={fields}
                organization={jobApplication.organization}
                defaultCountry={jobApplication.country}
              />

              <div className={'flex gap-4'}>
                <FormField field={fields.postingUrl} label="Posting URL">
                  <InputGroup className={'w-auto'}>
                    <InputGroupAddon>
                      <RiLink />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...getInputProps(fields.postingUrl, { type: 'text' })}
                      placeholder="https://"
                    />
                  </InputGroup>
                </FormField>

                <FormField field={fields.appliedAt} label="Applied Date" required>
                  <FieldControl form={form} field={fields.appliedAt}>
                    {(appliedAt) => (
                      <DateInput
                        {...appliedAt}
                        defaultValue={jobApplication.appliedAt}
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
                  {(source) => (
                    <SourceGroup
                      defaultValue={jobApplication.source ?? undefined}
                      change={source.change}
                      blur={source.blur}
                    />
                  )}
                </FieldControl>
              </FormField>

              <div className={'grid grid-cols-2 gap-4'}>
                <FormField field={fields.cvDocumentId} label="CV / Resume" required>
                  <FieldControl form={form} field={fields.cvDocumentId}>
                    {(cvId) => (
                      <DocumentPicker
                        {...getInputProps(fields.cvDocumentFile, { type: 'file' })}
                        documentType={DocumentType.CV}
                        defaultDocument={jobApplication.cv}
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
                        defaultDocument={jobApplication.coverLetter}
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
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditJobApplicationDialog;
