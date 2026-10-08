import { useState, useTransition } from 'react';
import { type DefaultValue, type SubmissionResult, useForm } from '@conform-to/react';
import type { z } from 'zod';
import { zodValidator } from '@/components/form/zod-validator.ts';

type FormAction = (
  state: SubmissionResult | undefined,
  formData: FormData
) => Promise<SubmissionResult | undefined>;

interface Options<Form extends Record<string, unknown>> {
  action: FormAction;
  schema: z.ZodType<Form>;
  defaultValue?: DefaultValue<Form>;
  onSuccess?: () => void;
}

export function useFormDialog<Form extends Record<string, unknown>>({
  action,
  schema,
  defaultValue,
  onSuccess,
}: Options<Form>) {
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
          form.reset();
          onSuccess?.();
        } else {
          setLastResult(result);
        }
      });
    },
  });

  return { open, setOpen, form, fields, isPending };
}
