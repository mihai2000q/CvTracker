import { z } from 'zod';

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
