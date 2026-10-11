import { useInputControl } from '@conform-to/react';

export function useFieldControl<Value extends string | string[] = string>(
  form: { id: string },
  field: { key?: string | null; name: string; initialValue?: unknown }
) {
  return useInputControl<Value>({
    key: field.key,
    name: field.name,
    formId: form.id,
    initialValue: field.initialValue as Value | undefined,
  });
}
