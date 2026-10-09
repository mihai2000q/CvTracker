// A value that either succeeded with data, or failed with errors - the
// app-layer return shape for anything that validates its own raw input
// (mirrors what a Server Action's own validation already produces, just
// generalized). `E` defaults to a zod-flattened field-errors shape, since
// that's the common case, but isn't fixed to it.
export type Result<T, E = Record<string, string[] | undefined>> =
  { success: true; data: T } | { success: false; errors: E };
