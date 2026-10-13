import type { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortEntry<Field extends string = string> {
  field: Field;
  direction: SortDirection;
}

// `field:direction` entries, the form a sort takes in a URL
export function serializeSort(sortBy: readonly SortEntry[]): string[] {
  return sortBy.map(({ field, direction }) => `${field}:${direction}`);
}

// The orders the sort picker offers. Any order is valid in the URL, but the picker
// only lists these; a URL with another order shows no option as selected.
export interface SortPreset<Field extends string = string> {
  label: string;
  // An element, not a component: options travel from server to client components
  icon?: ReactNode;
  sortBy: SortEntry<Field>[];
}

export interface SortOption {
  label: string;
  icon?: ReactNode;
  href: string;
  active: boolean;
}

export function buildSortOptions<Field extends string>(
  presets: readonly SortPreset<Field>[],
  sortBy: readonly string[],
  hrefForSortBy: (sortBy: SortEntry<Field>[]) => string
): SortOption[] {
  const current = sortBy.join();
  return presets.map((preset) => ({
    label: preset.label,
    icon: preset.icon,
    href: hrefForSortBy(preset.sortBy),
    active: serializeSort(preset.sortBy).join() === current,
  }));
}

// What a table header needs of one sort field: its direction while it leads the sort, and the
// link that sorts by it. A field starts ascending, then flips on each click.
export interface ColumnSort {
  direction?: SortDirection;
  href: string;
}

export function buildColumnSort<Field extends string>(
  field: Field,
  sortBy: readonly string[],
  hrefForSortBy: (sortBy: SortEntry<Field>[]) => string
): ColumnSort {
  const [leadField, leadDirection] = sortBy[0]?.split(':') ?? [];
  const direction = leadField === field ? (leadDirection as SortDirection) : undefined;

  return {
    direction,
    href: hrefForSortBy([{ field, direction: direction === 'asc' ? 'desc' : 'asc' }]),
  };
}
