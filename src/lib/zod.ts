import { z } from 'zod';
import { parseWithZod } from '@conform-to/zod/v4';
import { Result } from '@/types/result.ts';

// Conform strips an empty form field to `undefined` before validation —
// that's what makes `.optional()` fields work correctly over FormData
// (which has no way to represent "absent", only ''). It also does this for
// *required* fields, though, which replaces their own message with a
// generic Zod type error — so we disable that globally (parseWithZod's
// disableAutoCoercion) and restore the same "empty counts as absent"
// behavior explicitly, only on the fields that actually want it.
export function emptyToUndefined<Schema extends z.ZodType>(schema: Schema) {
  return z.preprocess((value) => (value === '' ? undefined : value), schema);
}

// Conform's auto-coercion treats an empty form field as `undefined` (so
// `.optional()` fields work over FormData's string-only representation),
// but that turns a blank required field into a raw Zod type-mismatch
// error instead of our own message. None of our schemas have non-string
// fields that need coercion, so it's simplest to just turn it off.
export function zodValidateForm<Schema extends z.ZodType>({
  formData,
  schema,
}: {
  formData: FormData;
  schema: Schema;
}) {
  return parseWithZod(formData, { schema, disableAutoCoercion: true });
}

// The non-conform, non-FormData sibling of `zodValidateForm` above:
// validates a plain input (a query-string-derived object, anything else
// raw) against a schema and returns a `Result` instead of a conform
// `Submission` - for an app-layer function that owns its own validation
// but isn't a form.
export function zodValidate<Schema extends z.ZodType>(
  input: unknown,
  schema: Schema
): Result<z.infer<Schema>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: z.flattenError(parsed.error).fieldErrors };
  }
  return { success: true, data: parsed.data };
}
