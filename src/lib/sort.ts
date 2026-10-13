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

// An order a sort picker offers
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
