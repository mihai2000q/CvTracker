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
} from '@/components/ui/dialog.tsx';
import { FieldGroup } from '@/components/ui/field.tsx';
import { useFormDialog } from '@/hooks/use-form-dialog.ts';
import { queryKeys } from '@/lib/query-keys.ts';
import { updateContact } from '@/features/organizations/actions/update-contact.ts';
import FieldControl from '@/components/form/field-control.tsx';
import FormField from '@/components/form/form-field.tsx';
import { Input } from '@/components/ui/input.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx';
import ContactRoleCombobox from '@/features/organizations/components/contact/contact-role-combobox.tsx';
import {
  UpdateContactForm,
  updateContactSchema,
} from '@/features/organizations/schemas/contact-schema.ts';
import { Contact } from '@/features/organizations/types/contact.ts';

interface Props {
  contact: Contact;
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditContactDialog = ({ contact, organizationId, open, onOpenChange }: Props) => {
  const queryClient = useQueryClient();
  const { dialogProps, contentProps, reset, resetKey, form, fields, isPending } =
    useFormDialog<UpdateContactForm>({
      action: updateContact,
      schema: updateContactSchema,
      defaultValue: {
        id: contact.id,
        name: contact.name,
        role: contact.role ?? undefined,
        phone: contact.phone ?? undefined,
        email: contact.email ?? undefined,
      },
      open,
      onOpenChange,
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: queryKeys.organizationContacts(organizationId) }),
    });

  return (
    <Dialog {...dialogProps}>
      <DialogContent {...contentProps} className="md:max-w-sm">
        <form id={form.id} onSubmit={form.onSubmit} noValidate>
          <input {...getInputProps(fields.id, { type: 'hidden' })} />

          <DialogHeader className={'mb-6'}>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>Change what you know about {contact.name}.</DialogDescription>
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
                      defaultValue={contact.role ?? undefined}
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditContactDialog;
