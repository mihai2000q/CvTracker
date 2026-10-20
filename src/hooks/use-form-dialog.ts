import { useEffect, useState, useTransition } from 'react';
import {
  type DefaultValue,
  type Submission,
  type SubmissionResult,
  useForm,
} from '@conform-to/react';
import type { z } from 'zod';
import { zodValidator } from '@/components/form/zod-validator.ts';

type FormAction = (
  state: SubmissionResult | undefined,
  formData: FormData
) => Promise<SubmissionResult | undefined>;

interface Props<Form extends Record<string, unknown>> {
  action: FormAction;
  // Not tied to `Form`: a schema may turn the fields into something else when it parses
  schema: z.ZodType;
  defaultValue?: DefaultValue<Form>;
  onReset?: () => void;
  onSuccess?: (formData: FormData) => void;
  // For a dialog opened from somewhere else, whose state lives there
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // Fields to revalidate when a field changes, for rules that span several of them. Conform
  // only revalidates the field that changed, so a dependent field's error would stay stale.
  // e.g. { cvDocumentFile: ['cvDocumentId'] }
  // Names are the form's field names, so a nested one reads 'newContact.name'
  deps?: Partial<Record<string, string[]>>;
}

type ConformForm<Form extends Record<string, unknown>> = ReturnType<typeof useForm<Form>>;

interface FormDialog<Form extends Record<string, unknown>> {
  dialogProps: { open: boolean; onOpenChange: (open: boolean) => void };
  contentProps: { keepMounted: boolean };
  reset: () => void;
  // Key for the container of the fields: it changes on every reset, so fields that keep their
  // own state start over
  resetKey: number;
  form: ConformForm<Form>[0];
  fields: ConformForm<Form>[1];
  isPending: boolean;
}

export function useFormDialog<Form extends Record<string, unknown>>({
  action,
  schema,
  defaultValue,
  onSuccess,
  onReset,
  deps,
  open: controlledOpen,
  onOpenChange,
}: Props<Form>): FormDialog<Form> {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [lastResult, setLastResult] = useState<SubmissionResult>();
  const [isPending, startTransition] = useTransition();
  // Bumped on every reset: the dialog stays mounted, so fields that keep their own state
  // (a picked organization, a date, a chosen file) only start over when remounted with this key
  const [resetKey, setResetKey] = useState(0);

  const [form, fields] = useForm<Form>({
    lastResult,
    defaultValue,
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    // Only the errors are used here, never the parsed value, so it need not be a `Form`
    onValidate: (context) => zodValidator(schema)(context) as Submission<Form, string[], Form>,
    onSubmit(event, { formData }) {
      event.preventDefault();
      startTransition(async () => {
        const result = await action(undefined, formData);
        if (result?.initialValue === null) {
          setOpen(false);
          reset();
          onSuccess?.(formData);
        } else {
          setLastResult(result);
        }
      });
    },
  });

  useEffect(() => {
    if (!deps) return;
    const revalidateDependents = (event: Event) => {
      const field = event.target as HTMLInputElement;
      if (field.form?.id !== form.id) return;
      deps[field.name as keyof Form & string]?.forEach((name) => form.validate({ name }));
    };
    document.addEventListener('input', revalidateDependents, true);
    return () => document.removeEventListener('input', revalidateDependents, true);
  });

  function reset() {
    form.reset();
    setResetKey((key) => key + 1);
    onReset?.();
  }

  // Keep mount only after it has been opened once, so that drafts are saved
  const [hasOpened, setHasOpened] = useState(false);
  if (open && !hasOpened) setHasOpened(true);

  return {
    dialogProps: { open, onOpenChange: setOpen },
    contentProps: { keepMounted: hasOpened },
    reset,
    resetKey,
    form,
    fields,
    isPending,
  };
}
