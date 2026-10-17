'use client';

import React from 'react';
import { getInputProps } from '@conform-to/react';
import { RiMailLine, RiPhoneLine } from '@remixicon/react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button.tsx';
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
import { useFormDialog } from '@/hooks/use-form-dialog.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import { createContact } from '@/features/organizations/actions/create-contact.ts';
import FieldControl from '@/components/form/field-control.tsx';
import FormField from '@/components/form/form-field.tsx';
import { Input } from '@/components/ui/input.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx';
import ContactRoleCombobox from '@/features/organizations/components/contact/contact-role-combobox.tsx';
import {
  CreateContactForm,
  createContactSchema,
} from '@/features/organizations/schemas/contact-schema.ts';

interface Props {
  organizationId: string;
  children: React.ReactElement;
}

const CreateContactDialog = ({ organizationId, children }: Props) => {
  const queryClient = useQueryClient();
  const { dialogProps, contentProps, reset, resetKey, form, fields, isPending } =
    useFormDialog<CreateContactForm>({
      action: createContact,
      schema: createContactSchema,
      defaultValue: { organizationId },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: queryKeys.organizationContacts(organizationId) }),
    });

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger render={children} />
      <DialogContent {...contentProps} className="md:max-w-sm">
        <form id={form.id} onSubmit={form.onSubmit} noValidate>
          <input {...getInputProps(fields.organizationId, { type: 'hidden' })} />

          <DialogHeader className={'mb-6'}>
            <DialogTitle>New Contact</DialogTitle>
            <DialogDescription>
              Someone you deal with at this organization. Fill in what you know.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup key={resetKey}>
            <FormField field={fields.name} label="Name" required>
              <Input
                {...getInputProps(fields.name, { type: 'text' })}
                placeholder="e.g. Anna Schmidt"
                maxLength={150}
              />
            </FormField>

            <div className={'flex gap-4'}>
              <FormField field={fields.role} label="Role">
                <FieldControl form={form} field={fields.role}>
                  {(role) => (
                    <ContactRoleCombobox
                      change={role.change}
                      blur={role.blur}
                      id={fields.role.id}
                      invalid={!fields.role.valid}
                    />
                  )}
                </FieldControl>
              </FormField>

              <FormField field={fields.phone} label="Phone">
                <InputGroup className={'w-auto'}>
                  <InputGroupAddon>
                    <RiPhoneLine />
                  </InputGroupAddon>
                  <InputGroupInput
                    {...getInputProps(fields.phone, { type: 'tel' })}
                    placeholder="+49 170 1234567"
                    maxLength={50}
                  />
                </InputGroup>
              </FormField>
            </div>

            <FormField field={fields.email} label="Email">
              <InputGroup>
                <InputGroupAddon>
                  <RiMailLine />
                </InputGroupAddon>
                <InputGroupInput
                  {...getInputProps(fields.email, { type: 'email' })}
                  placeholder="name@company.com"
                  maxLength={255}
                />
              </InputGroup>
            </FormField>
          </FieldGroup>

          <DialogFooter className={'pt-6'}>
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

export default CreateContactDialog;
