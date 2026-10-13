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

export const COUNTRY_SORT_FIELDS = ['name', 'jobApplications', 'organizations'] as const;
export type CountrySortField = (typeof COUNTRY_SORT_FIELDS)[number];

export const DEFAULT_COUNTRY_SORT_BY: SortEntry<CountrySortField>[] = [
  { field: 'jobApplications', direction: 'desc' },
];

// The orders the sort picker offers. Any order is valid in the URL, but the picker
// only lists these; a URL with another order shows no option as selected.
export const COUNTRY_SORT_PRESETS: SortPreset<CountrySortField>[] = [
  { label: 'Most applications', icon: <RiBriefcaseLine />, sortBy: DEFAULT_COUNTRY_SORT_BY },
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

type CountryAccessor = ModelAccessor<Contract, 'Country', 'public'>;

export const countrySorters = (userId: string): Sorters<CountryAccessor, CountrySortField> => ({
  name: (c) => c.name,
  jobApplications: (c) => c.jobApplications.count((ja) => ja.userId.eq(uuid(userId))),
  organizations: (c) =>
    c.organizationCountries.count((oc) => oc.organization.some((o) => o.userId.eq(uuid(userId)))),
});

// Countries that tie on the sort read alphabetically, and `id` settles the rest
export const COUNTRY_TIEBREAKERS: Tiebreakers<CountryAccessor> = [
  (c) => c.name.asc(),
  (c) => c.id.asc(),
];
