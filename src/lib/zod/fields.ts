import { z } from 'zod';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const zFile = z
  .file('File is required')
  .min(1, 'File cannot be empty')
  .max(MAX_FILE_SIZE, 'File must be 10 MB or smaller')
  .mime(ALLOWED_FILE_TYPES, 'File must be a PDF or Word document');

// Conform strips an empty form field to `undefined` before validation —
// that's what makes `.optional()` fields work correctly over FormData
// (which has no way to represent "absent", only ''). It also does this for
// *required* fields, though, which replaces their own message with a
// generic Zod type error — so we disable that globally (parseWithZod's
// disableAutoCoercion) and restore the same "empty counts as absent"
// behavior explicitly, only on the fields that actually want it.
export function zEmptyToUndefined<Schema extends z.ZodType>(schema: Schema) {
  return z.preprocess((value) => (value === '' ? undefined : value), schema);
}

// With auto-coercion disabled (see `zodValidateForm` below), a multi-value
// FormData field (a `<select multiple>`, several same-named checkboxes)
// only actually looks like an array once 2+ entries are submitted: exactly
// one entry comes through as a bare string, and none at all (nothing
// selected - the field isn't even present in the FormData) comes through
// as `undefined`. Either one fails `z.array()`'s own type check before a
// `.min(1)` message ever gets a chance to fire. Normalize both before
// validating.
export function zToArray<Schema extends z.ZodType>(schema: Schema) {
  return z.preprocess((value) => {
    if (value === undefined) return [];
    return typeof value === 'string' ? [value] : value;
  }, schema);
}
