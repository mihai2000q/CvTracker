import { z } from 'zod';
import type { SortDirection, SortEntry } from '@/lib/sort.ts';

// A sort is a list of `field:direction` entries in priority order, such as the repeated
// param in `?s=jobApplications:desc&s=name:asc`. A lone `name` reads as ascending.
// Without entries the list is empty, and a field can't appear twice.
export function sortSchema<Field extends string>(fields: readonly [Field, ...Field[]]) {
  return z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value, ctx) => parseSortBy(fields, value ?? [], ctx));
}

function parseSortBy<Field extends string>(
  fields: readonly Field[],
  value: string | string[],
  ctx: z.core.$RefinementCtx
): SortEntry<Field>[] {
  const isField = (field: string): field is Field => (fields as readonly string[]).includes(field);
  const isDirection = (direction: string): direction is SortDirection =>
    direction === 'asc' || direction === 'desc';

  const sortBy: SortEntry<Field>[] = [];
  const seen = new Set<Field>();

  [value].flat().forEach((entry, index) => {
    const parts = entry.split(':');
    const [field, direction = 'asc'] = parts;
    if (parts.length > 2 || !isField(field) || !isDirection(direction)) {
      ctx.addIssue({ code: 'custom', message: `Invalid sort: ${entry}`, path: [index] });
    } else if (seen.has(field)) {
      ctx.addIssue({ code: 'custom', message: `Duplicate sort field: ${field}`, path: [index] });
    } else {
      seen.add(field);
      sortBy.push({ field, direction });
    }
  });

  return sortBy;
}
