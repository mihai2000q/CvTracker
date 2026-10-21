'use client';

import React, { useState } from 'react';
import { type FieldMetadata, getInputProps } from '@conform-to/react';
import { RiAddLine, RiCloseLine, RiMailLine, RiPhoneLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible.tsx';
import { FieldGroup } from '@/components/ui/field.tsx';
import FormField from '@/components/form/form-field.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useFieldControl } from '@/hooks/use-field-control.ts';
import ContactRoleCombobox from '@/features/organizations/components/contact/contact-role-combobox.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx';
import { ScheduleInterviewForm } from '@/features/job-applications/schemas/schedule-interview-schema.ts';
import { ContactForm } from '@/features/organizations/schemas/contact-schema.ts';
import { cn } from '@/lib/utils.ts';

const NewContactSection = ({
  contact,
  onClose,
}: {
  contact: FieldMetadata<ContactForm | undefined, ScheduleInterviewForm>;
  onClose: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) onClose();
  };
  const fields = contact.getFieldset();
  const role = useFieldControl({ id: contact.formId }, fields.role);

  return (
    <Collapsible
      open={open}
      onOpenChange={handleOpenChange}
      className={cn(
        '-my-2 rounded-lg border border-transparent px-2 py-2',
        'data-open:bg-background/30 data-open:border-border',
        'transition-colors duration-200'
      )}
    >
      <CollapsibleTrigger
        render={<Button type={'button'} variant={'ghost'} size={'sm'} className={'w-fit'} />}
      >
        {open ? <RiCloseLine /> : <RiAddLine />}
        {open ? 'Cancel new contact' : 'Add a new contact'}
      </CollapsibleTrigger>

      <CollapsibleContent>
        <FieldGroup className={'px-2 pt-4 pb-2'}>
          <FormField field={fields.name} label="Name" required>
            <Input
              {...getInputProps(fields.name, { type: 'text' })}
              placeholder="e.g. Anna Schmidt"
              maxLength={150}
            />
          </FormField>

          <div className={'flex gap-4'}>
            <FormField field={fields.role} label="Role">
              <ContactRoleCombobox {...role} id={fields.role.id} invalid={!fields.role.valid} />
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
      </CollapsibleContent>
    </Collapsible>
  );
};

export default NewContactSection;
