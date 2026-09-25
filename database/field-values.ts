// Several generated field types carry extra compile-time-only markers
// TypeScript can't construct from a plain literal: sized varchar(N) fields
// (`string & { readonly __varcharLength: N }`) and uuidString() fields, id
// presets aside (`string & { readonly __charLength: 36 }`). Both marker
// shapes live in an internal package (`@prisma/orm-target-postgres`) this
// project's own conventions (and the framework's docs) say never to import
// from. TypeScript only checks shape, though: a locally-declared type with
// the identical shape is assignable wherever the real one is expected, so
// these helpers reproduce just that shape without importing anything
// internal. Every write path (signup creating a `User`, creating a
// `JobApplication`, etc.) that touches a varchar or uuidString field needs
// one of these.
export type Sized<N extends number> = string & { readonly __varcharLength: N };

export function sized<N extends number>(value: string): Sized<N> {
  return value as Sized<N>;
}

export type UuidValue = string & { readonly __charLength: 36 };

export function uuid(value: string): UuidValue {
  return value as UuidValue;
}
