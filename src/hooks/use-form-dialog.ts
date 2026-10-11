import { useEffect, useState, useTransition } from 'react';
import { type DefaultValue, type SubmissionResult, useForm } from '@conform-to/react';
import type { z } from 'zod';
import { zodValidator } from '@/components/form/zod-validator.ts';

type FormAction = (
  state: SubmissionResult | undefined,
  formData: FormData
) => Promise<SubmissionResult | undefined>;

interface Props<Form extends Record<string, unknown>> {
  action: FormAction;
  schema: z.ZodType<Form>;
  defaultValue?: DefaultValue<Form>;
  onReset?: () => void;
  onSuccess?: (formData: FormData) => void;
  // Fields to revalidate when a field changes, for rules that span several of them. Conform
  // only revalidates the field that changed, so a dependent field's error would stay stale.
  // e.g. { cvDocumentFile: ['cvDocumentId'] }
  deps?: Partial<Record<keyof Form & string, Array<keyof Form & string>>>;
}

export function useFormDialog<Form extends Record<string, unknown>>({
  action,
  schema,
  defaultValue,
  onSuccess,
  onReset,
  deps,
}: Props<Form>) {
  const [open, setOpen] = useState(false);
  const [lastResult, setLastResult] = useState<SubmissionResult>();
  const [isPending, startTransition] = useTransition();

  const [form, fields] = useForm<Form>({
    lastResult,
    defaultValue,
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: zodValidator(schema),
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
    onReset?.();
  }

  // Keep mount only after it has been opened once, so that drafts are saved
  const [hasOpened, setHasOpened] = useState(false);
  if (open && !hasOpened) setHasOpened(true);

  return {
    dialogProps: { open, onOpenChange: setOpen },
    contentProps: { keepMounted: hasOpened },
    reset,
    form,
    fields,
    isPending,
  };
}
