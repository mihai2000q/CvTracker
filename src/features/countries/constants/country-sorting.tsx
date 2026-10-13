import {
  RiBriefcaseLine,
  RiBuildingLine,
  RiSortAlphabetAsc,
  RiSortAlphabetDesc,
} from '@remixicon/react';
import { uuid } from '@database/field-values';
import type { ModelAccessor } from '@prisma/orm-postgres/orm-client';
import type { Contract } from '@database/contract.d';
import type { Sorters, Tiebreakers } from '@database/sort.ts';
import type { SortEntry, SortPreset } from '@/lib/sort.ts';

// Fields
export const COUNTRY_SORT_FIELDS = ['name', 'jobApplications', 'organizations'] as const;
export type CountrySortField = (typeof COUNTRY_SORT_FIELDS)[number];

// Default Sort By
export const DEFAULT_COUNTRY_SORT_BY: SortEntry<CountrySortField>[] = [
  { field: 'jobApplications', direction: 'desc' },
];

// Presets
export const COUNTRY_SORT_PRESETS: SortPreset<CountrySortField>[] = [
  {
    label: 'Most applications',
    icon: <RiBriefcaseLine />,
    sortBy: DEFAULT_COUNTRY_SORT_BY,
  },
  {
    label: 'Most organizations',
    icon: <RiBuildingLine />,
    sortBy: [{ field: 'organizations', direction: 'desc' }],
  },
  {
    label: 'Name (A-Z)',
    icon: <RiSortAlphabetAsc />,
    sortBy: [{ field: 'name', direction: 'asc' }],
  },
  {
    label: 'Name (Z-A)',
    icon: <RiSortAlphabetDesc />,
    sortBy: [{ field: 'name', direction: 'desc' }],
  },
];

// Sorters
type CountryAccessor = ModelAccessor<Contract, 'Country', 'public'>;

export const countrySorters = (userId: string): Sorters<CountryAccessor, CountrySortField> => ({
  name: (c) => c.name,
  jobApplications: (c) => c.jobApplications.count((ja) => ja.userId.eq(uuid(userId))),
  organizations: (c) =>
    c.organizationCountries.count((oc) => oc.organization.some((o) => o.userId.eq(uuid(userId)))),
});

// Tiebreakers
export const COUNTRY_TIEBREAKERS: Tiebreakers<CountryAccessor> = [
  (c) => c.name.asc(),
  (c) => c.id.asc(),
];
