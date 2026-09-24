// The generated contract types a varchar(N) field as a branded string
// (`string & { readonly __varcharLength: N }`), so plain string literals
// aren't directly assignable to `.create()`/`.upsert()` inputs — TypeScript
// can't invent the phantom property on a bare string. That brand type lives
// in an internal target package user code isn't supposed to import
// (`@prisma/orm-target-postgres`, one of the paths the framework's own docs
// say never to reach into). TypeScript brands are structural, though: a
// locally-declared type with the identical shape is assignable wherever the
// real one is expected, so this reproduces just that shape without
// importing anything internal. Shared here since every seed file that
// writes to a varchar(N) field needs it, not just one.
export type Sized<N extends number> = string & { readonly __varcharLength: N };

export function sized<N extends number>(value: string): Sized<N> {
  return value as Sized<N>;
}
