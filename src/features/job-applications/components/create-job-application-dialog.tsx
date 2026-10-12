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
import { getInputProps } from '@conform-to/react';
import { useFieldControl } from '@/hooks/use-field-control.ts';
import { createJobApplication } from '@/features/job-applications/actions/create-job-application.ts';
import {
  CreateJobApplicationForm,
  createJobApplicationSchema,
} from '@/features/job-applications/schemas/create-job-application-schema.ts';
import { useQueryClient } from '@tanstack/react-query';
import { useFormDialog } from '@/hooks/use-form-dialog.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import OrganizationCombobox from '@/features/organizations/components/organization-combobox.tsx';
import CountryCombobox from '@/features/countries/components/country-combobox.tsx';
import { CountrySummary } from '@/features/countries/types/country.ts';
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

interface Props {
  children: React.ReactElement;
}

const CreateJobApplicationDialog = ({ children }: Props) => {
  const queryClient = useQueryClient();
  const { dialogProps, contentProps, reset, resetKey, form, fields, isPending } =
    useFormDialog<CreateJobApplicationForm>({
      action: createJobApplication,
      schema: createJobApplicationSchema,
      deps: { cvDocumentFile: ['cvDocumentId'] },
      onReset: () => {
        setCountry(null);
      },
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

  // Organization
  const organizationName = useFieldControl(form, fields.organizationName);
  const handleOrganizationChange = (organization: OrganizationSummary | string) => {
    if (typeof organization === 'string') {
      organizationName.change(organization);
      return;
    }
    organizationName.change(organization.name);
    // Only pre-fills an empty country, never replaces one the user chose
    const [firstCountry] = organization.countries;
    if (firstCountry && !country) handleCountryChange(firstCountry);
  };

  // Country
  const countryId = useFieldControl(form, fields.countryId);
  // for the organization to prefill
  const [country, setCountry] = useState<CountrySummary | null>(null);
  const handleCountryChange = (next: CountrySummary | null) => {
    setCountry(next);
    countryId.change(next?.id ?? '');
  };

  // AppliedAt
  const appliedAt = useFieldControl(form, fields.appliedAt);
  // Source
  const source = useFieldControl(form, fields.source);
  // Documents
  const cvId = useFieldControl(form, fields.cvDocumentId);
  const coverLetterId = useFieldControl(form, fields.coverLetterDocumentId);

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger render={children} />
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

              <div className={'flex gap-4'}>
                <FormField field={fields.organizationName} label="Organization" required>
                  <OrganizationCombobox
                    idName={fields.organizationId.name}
                    change={handleOrganizationChange}
                    blur={organizationName.blur}
                    id={fields.organizationName.id}
                    invalid={!fields.organizationName.valid}
                  />
                </FormField>

                <FormField field={fields.countryId} label="Country" required>
                  <CountryCombobox
                    value={country}
                    change={handleCountryChange}
                    blur={countryId.blur}
                    id={fields.countryId.id}
                    invalid={!fields.countryId.valid}
                  />
                </FormField>
              </div>

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
                  <DateInput
                    {...appliedAt}
                    id={fields.appliedAt.id}
                    invalid={!fields.appliedAt.valid}
                    disable={'future'}
                  />
                </FormField>
              </div>

              <FormField field={fields.source} label="Source">
                <SourceGroup {...source} />
              </FormField>

              <div className={'grid grid-cols-2 gap-4'}>
                <FormField field={fields.cvDocumentId} label="CV / Resume" required>
                  <DocumentPicker
                    {...getInputProps(fields.cvDocumentFile, { type: 'file' })}
                    documentType={DocumentType.CV}
                    selectorProps={{
                      ...cvId,
                      id: fields.cvDocumentId.id,
                      invalid: !fields.cvDocumentId.valid,
                    }}
                  />
                </FormField>

                <FormField field={fields.coverLetterDocumentId} label="Cover Letter">
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
