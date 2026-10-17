'use client';

import React from 'react';
import { getInputProps } from '@conform-to/react';
import { useQueryClient } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { useFormDialog } from '@/hooks/use-form-dialog.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import CountryMultiCombobox from '@/features/countries/components/country-multi-combobox.tsx';
import { updateOrganization } from '@/features/organizations/actions/update-organization.ts';
import {
  UpdateOrganizationForm,
  updateOrganizationSchema,
} from '@/features/organizations/schemas/update-organization-schema.ts';
import { OrganizationDetail } from '@/features/organizations/types/organization.ts';

interface Props {
  organization: OrganizationDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditOrganizationDialog = ({ organization, open, onOpenChange }: Props) => {
  const queryClient = useQueryClient();
  const { dialogProps, contentProps, reset, resetKey, form, fields, isPending } =
    useFormDialog<UpdateOrganizationForm>({
      action: updateOrganization,
      schema: updateOrganizationSchema,
      defaultValue: {
        id: organization.id,
        name: organization.name,
        websiteUrl: organization.websiteUrl ?? undefined,
        notes: organization.notes ?? undefined,
        countryIds: organization.countries.map((country) => country.id),
      },
      open,
      onOpenChange,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.organizations }),
    });

  return (
    <Dialog {...dialogProps}>
      <DialogContent {...contentProps} className="md:max-w-md">
        <form id={form.id} onSubmit={form.onSubmit} noValidate>
          <input {...getInputProps(fields.id, { type: 'hidden' })} />

          <DialogHeader className={'mb-6'}>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>Change the details of this organization.</DialogDescription>
          </DialogHeader>

          <ScrollArea>
            <FieldGroup key={resetKey} className={'max-h-[55vh]'}>
              <FormField field={fields.name} label="Name" required>
                <Input {...getInputProps(fields.name, { type: 'text' })} maxLength={200} />
              </FormField>

              <FormField field={fields.websiteUrl} label="Website">
                <InputGroup className={'w-auto'}>
                  <InputGroupAddon>
                    <RiLink />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder={'https://example.com'}
                    {...getInputProps(fields.websiteUrl, { type: 'text' })}
                  />
                </InputGroup>
              </FormField>

              <FormField field={fields.countryIds} label="Countries" required>
                <FieldControl<string[]> form={form} field={fields.countryIds}>
                  {(countryIds) => (
                    <CountryMultiCombobox
                      defaultValue={organization.countries}
                      onChange={countryIds.change}
                      onBlur={countryIds.blur}
                    />
                  )}
                </FieldControl>
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

          <DialogFooter className={'pt-2'}>
            <DialogClose onClick={reset} render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" loading={isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrganizationDialog;
