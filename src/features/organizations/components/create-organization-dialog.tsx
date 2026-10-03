'use client';

import React from 'react';
import { getInputProps, useInputControl } from '@conform-to/react';
import { useFormDialog } from '@/hooks/use-form-dialog.ts';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Button } from '@/components/ui/button.tsx';
import { createOrganization } from '@/features/organizations/actions/create-organization.ts';
import {
  CreateOrganizationForm,
  createOrganizationSchema,
} from '@/features/organizations/schemas/create-organization-schema.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import CountryMultiCombobox from '@/components/combobox/country-multi-combobox.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx';
import { RiLink } from '@remixicon/react';

interface Props {
  children: React.ReactElement;
}

const CreateOrganizationDialog = ({ children }: Props) => {
  const { open, setOpen, form, fields, isPending } = useFormDialog<CreateOrganizationForm>({
    action: createOrganization,
    schema: createOrganizationSchema,
  });

  const countryIds = useInputControl<string[]>({
    key: fields.countryIds.key,
    name: fields.countryIds.name,
    formId: form.id,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="md:max-w-md">
        <form id={form.id} onSubmit={form.onSubmit} noValidate>
          <DialogHeader className={'mb-6'}>
            <DialogTitle>New Organization</DialogTitle>
            <DialogDescription>
              Record an organization you&#39;ve applied to. Fill in and save.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={fields.name.id} required>
                Name
              </FieldLabel>
              <Input
                placeholder={'Example'}
                {...getInputProps(fields.name, { type: 'text' })}
                maxLength={200}
              />
              <FieldError errors={fields.name.errors} />
            </Field>

            <Field>
              <FieldLabel htmlFor={fields.websiteUrl.id}>Website</FieldLabel>
              <InputGroup className={'w-auto'}>
                <InputGroupAddon>
                  <RiLink />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder={'https://example.com'}
                  {...getInputProps(fields.websiteUrl, { type: 'text' })}
                />
              </InputGroup>
              <FieldError errors={fields.websiteUrl.errors} />
            </Field>

            <Field>
              <FieldLabel htmlFor={fields.countryIds.id} required>
                Countries
              </FieldLabel>
              <CountryMultiCombobox onChange={countryIds.change} onBlur={countryIds.blur} />
              <FieldError errors={fields.countryIds.errors} />
            </Field>

            <Field>
              <FieldLabel htmlFor={fields.notes.id}>Notes</FieldLabel>
              <Textarea
                placeholder={'Add any extra content...'}
                {...getInputProps(fields.notes, { type: 'text' })}
                className={'max-h-32'}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className={'sm:flex-col'}>
            <Separator />
            <div className={'flex justify-end gap-2'}>
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button type="submit" loading={isPending}>
                Create
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrganizationDialog;
