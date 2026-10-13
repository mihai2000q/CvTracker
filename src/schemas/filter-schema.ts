import { z } from 'zod';
import type { FilterColumn } from '@database/filter.ts';
import { FILTER_OPERATORS, type FilterEntry, type FilterOperator } from '@/lib/filter.ts';

// What a filterable field is: the shape of its value, which each item of a list has too, or
// that with the `column` it filters when it isn't a model field of the same name
type FilterDefinition = z.ZodType | (FilterColumn<never> & { value: z.ZodType });

const valueOf = (definition: FilterDefinition) =>
  definition instanceof z.ZodType ? definition : definition.value;

// Operators
const LIST_OPERATORS: readonly FilterOperator[] = ['in', 'notIn'];
const EQUALITY_OPERATORS: readonly FilterOperator[] = ['eq', 'neq', 'in', 'notIn'];
const ORDER_OPERATORS: readonly FilterOperator[] = ['gt', 'gte', 'lt', 'lte'];

function operatorsOf(value: z.ZodType): readonly FilterOperator[] {
  const { type } = value._zod.def;
  const format = 'format' in value ? value.format : null;

  // A date or a time orders; any other string (a UUID) is only equal or not
  const orders =
    type === 'number' ||
    type === 'bigint' ||
    type === 'date' ||
    (type === 'string' && (format === 'date' || format === 'datetime' || format === 'time'));
  return orders ? [...EQUALITY_OPERATORS, ...ORDER_OPERATORS] : EQUALITY_OPERATORS;
}

// A filter is a list of `field:operator:value` entries, such as the repeated param in
// `?f=status:eq:interview&f=appliedAt:gte:2025-12-12`. The operators that compare against a
// list take its values joined by commas, as in `status:in:offer,interview`. A field can
// appear again with another operator, to bound a range, but not with the same one.
export function filterSchema<Field extends string>(definitions: Record<Field, FilterDefinition>) {
  return z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value, ctx) => parseFilterBy(definitions, value ?? [], ctx));
}

function parseFilterBy<Field extends string>(
  definitions: Record<Field, FilterDefinition>,
  value: string | string[],
  ctx: z.core.$RefinementCtx
): FilterEntry<Field>[] {
  const isField = (field: string): field is Field => Object.hasOwn(definitions, field);
  const isOperator = (operator: string): operator is FilterOperator =>
    (FILTER_OPERATORS as readonly string[]).includes(operator);

  const filterBy: FilterEntry<Field>[] = [];
  const seen = new Set<string>();

  [value].flat().forEach((entry, index) => {
    // The value is everything after the second colon, so it can hold colons itself
    const [field, operator, ...rest] = entry.split(':');
    const issue = (message: string) =>
      ctx.addIssue({ code: 'custom', message: `${message}: ${entry}`, path: [index] });

    if (!isField(field) || !isOperator(operator)) {
      return issue('Invalid filter');
    }
    const fieldValue = valueOf(definitions[field]);
    if (!operatorsOf(fieldValue).includes(operator)) {
      return issue('Invalid filter');
    }
    if (seen.has(`${field}:${operator}`)) {
      return issue('Duplicate filter');
    }

    const rawValue = rest.join(':');
    const parsed = LIST_OPERATORS.includes(operator)
      ? z.array(fieldValue).min(1).safeParse(rawValue.split(','))
      : fieldValue.safeParse(rawValue);
    if (!parsed.success) {
      return issue('Invalid filter value');
    }

    seen.add(`${field}:${operator}`);
    filterBy.push({ field, operator, value: parsed.data });
  });

  return filterBy;
}
