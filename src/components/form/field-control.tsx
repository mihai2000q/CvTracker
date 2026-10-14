import React from 'react';
import { useFieldControl } from '@/hooks/use-field-control.ts';

interface Props<Value extends string | string[]> {
  form: { id: string };
  field: { key?: string | null; name: string; initialValue?: unknown };
  children: (control: ReturnType<typeof useFieldControl<Value>>) => React.ReactNode;
}

// For a control that renders no named input of its own (e.g. a toggle group). The hook has to
// mount together with the form: a dialog mounts its content on first open, and useInputControl
// only looks for the form when it first runs, so called from the dialog itself it finds nothing
// and the field is missing from FormData until it is touched
const FieldControl = <Value extends string | string[] = string>({
  form,
  field,
  children,
}: Props<Value>) => children(useFieldControl<Value>(form, field));

export default FieldControl;
