import { SortEntry, type SortPreset } from '@/lib/sort.ts';
import {
  RiBriefcase2Line,
  RiBriefcaseLine,
  RiHistoryLine,
  RiSortAlphabetAsc,
  RiSortNumberDesc,
  RiTimeLine,
} from '@remixicon/react';
import type { ModelAccessor } from '@prisma/orm-postgres/orm-client';
import type { Sorters, Tiebreakers } from '@database/sort.ts';
import type { Contract } from '@database/contract.d';

// Fields
export const DOCUMENT_SORT_FIELDS = ['name', 'jobApplications', 'uploadedAt', 'size'] as const;
export type DocumentSortField = (typeof DOCUMENT_SORT_FIELDS)[number];

// Default Sort By
export const DEFAULT_DOCUMENT_SORT_BY: SortEntry<DocumentSortField>[] = [
  { field: 'uploadedAt', direction: 'desc' },
];

export const DOCUMENT_SORT_PRESETS: SortPreset<DocumentSortField>[] = [
  { label: 'Newest', icon: <RiTimeLine />, sortBy: DEFAULT_DOCUMENT_SORT_BY },
  {
    label: 'Oldest',
    icon: <RiHistoryLine />,
    sortBy: [{ field: 'uploadedAt', direction: 'asc' }],
  },
  {
    label: 'Most applications',
    icon: <RiBriefcaseLine />,
    sortBy: [{ field: 'jobApplications', direction: 'desc' }],
  },
  {
    label: 'Least applications',
    icon: <RiBriefcase2Line />,
    sortBy: [{ field: 'jobApplications', direction: 'asc' }],
  },
  {
    label: 'Alphabetically',
    icon: <RiSortAlphabetAsc />,
    sortBy: [{ field: 'name', direction: 'asc' }],
  },
  {
    label: 'Largest Size',
    icon: <RiSortNumberDesc />,
    sortBy: [{ field: 'size', direction: 'desc' }],
  },
];

// Sorters
type DocumentAccessor = ModelAccessor<Contract, 'Document', 'public'>;

export const documentSorters: Sorters<DocumentAccessor, DocumentSortField> = {
  name: (d) => d.name,
  jobApplications: (d) => d.cvForJobApplications.count(),
  uploadedAt: (d) => d.uploadedAt,
  size: (d) => d.size,
};

// Tiebreakers
export const DOCUMENT_TIEBREAKERS: Tiebreakers<DocumentAccessor> = [
  (c) => c.name.asc(),
  (c) => c.id.asc(),
];
