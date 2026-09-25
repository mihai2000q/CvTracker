import { parseWithZod } from '@conform-to/zod/v4';
import type { z } from 'zod';

export function zodValidator<Schema extends z.ZodType>(schema: Schema) {
  // Conform's auto-coercion treats an empty form field as `undefined` (so
  // `.optional()` fields work over FormData's string-only representation),
  // but that turns a blank required field into a raw Zod type-mismatch
  // error instead of our own message. None of our schemas have non-string
  // fields that need coercion, so it's simplest to just turn it off.
  return ({ formData }: { formData: FormData }) =>
    parseWithZod(formData, { schema, disableAutoCoercion: true });
}
