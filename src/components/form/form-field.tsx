import React from 'react';
import { Field, FieldError, FieldLabel } from '@/components/ui/field.tsx';

interface Props extends Omit<React.ComponentProps<typeof Field>, 'children'> {
  field: { id: string; errors?: string[] };
  label: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}

const FormField = ({ field, label, required, children, ...props }: Props) => (
  <Field {...props}>
    <FieldLabel htmlFor={field.id} required={required}>
      {label}
    </FieldLabel>
    {children}
    <FieldError errors={field.errors} />
  </Field>
);

export default FormField;
