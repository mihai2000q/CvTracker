'use client';

import { queryKeys } from '@/lib/query-keys.ts';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getInputProps } from '@conform-to/react';
import { useFieldControl } from '@/hooks/use-field-control.ts';
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
import { FieldGroup } from '@/components/ui/field.tsx';
import FormField from '@/components/form/form-field.tsx';
import { Input } from '@/components/ui/input.tsx';
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
import { ScrollArea } from '@/components/ui/scroll-area.tsx';

interface Props {
  children: React.ReactElement;
}

const CreateOrganizationDialog = ({ children }: Props) => {
  const queryClient = useQueryClient();
  const { dialogProps, contentProps, reset, resetKey, form, fields, isPending } =
    useFormDialog<CreateOrganizationForm>({
      action: createOrganization,
      schema: createOrganizationSchema,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.organizations }),
    });

  const countryIds = useFieldControl<string[]>(form, fields.countryIds);

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger render={children} />
      <DialogContent {...contentProps} className="md:max-w-md">
        <form id={form.id} onSubmit={form.onSubmit} noValidate>
          <DialogHeader className={'mb-6'}>
            <DialogTitle>New Organization</DialogTitle>
            <DialogDescription>
              Record an organization you&#39;ve applied to. Fill in and save.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea>
            <FieldGroup key={resetKey} className={'max-h-[55vh]'}>
              <FormField field={fields.name} label="Name" required>
                <Input
                  placeholder={'Example'}
                  {...getInputProps(fields.name, { type: 'text' })}
                  maxLength={200}
                />
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
                <CountryMultiCombobox onChange={countryIds.change} onBlur={countryIds.blur} />
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

          <DialogFooter className={'pt-2 sm:justify-center'}>
            <DialogClose onClick={reset} render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" loading={isPending}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrganizationDialog;
