import { SortEntry, type SortPreset } from '@/lib/sort.ts';
import {
  RiBriefcase2Line,
  RiBriefcaseLine,
  RiHistoryLine,
  RiPulseLine,
  RiRefreshLine,
  RiSortAlphabetAsc,
  RiTimeLine,
} from '@remixicon/react';
import type { ModelAccessor, Orderable } from '@prisma/orm-postgres/orm-client';
import {
  AggregateExpr,
  BinaryExpr,
  ColumnRef,
  FunctionCallExpr,
  OrderByItem,
  ProjectionItem,
  SelectAst,
  SubqueryExpr,
  TableSource,
} from '@prisma/orm-postgres/relational-core/ast';
import type { Sorters, Tiebreakers } from '@database/sort.ts';
import type { Contract } from '@database/contract.d';

// Fields
export const ORGANIZATION_SORT_FIELDS = [
  'name',
  'createdAt',
  'updatedAt',
  'lastActivityAt',
  'jobApplications',
] as const;
export type OrganizationSortField = (typeof ORGANIZATION_SORT_FIELDS)[number];

// Default Sort By
export const DEFAULT_ORGANIZATION_SORT_BY: SortEntry<OrganizationSortField>[] = [
  { field: 'lastActivityAt', direction: 'desc' },
];

export const ORGANIZATION_SORT_PRESETS: SortPreset<OrganizationSortField>[] = [
  {
    label: 'Last activity',
    icon: <RiPulseLine />,
    sortBy: DEFAULT_ORGANIZATION_SORT_BY,
  },
  {
    label: 'Recently updated',
    icon: <RiRefreshLine />,
    sortBy: [{ field: 'updatedAt', direction: 'desc' }],
  },
  {
    label: 'Newest',
    icon: <RiTimeLine />,
    sortBy: [{ field: 'createdAt', direction: 'desc' }],
  },
  {
    label: 'Oldest',
    icon: <RiHistoryLine />,
    sortBy: [{ field: 'createdAt', direction: 'asc' }],
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
];

// Sorters
type OrganizationAccessor = ModelAccessor<Contract, 'Organization', 'public'>;

export const organizationSorters: Sorters<OrganizationAccessor, OrganizationSortField> = {
  name: (o) => o.name,
  createdAt: (o) => o.createdAt,
  updatedAt: (o) => o.updatedAt,
  jobApplications: (o) => o.jobApplications.count(),
  lastActivityAt: () => lastActivityAt,
};

// The `lastActivityAt` the cards show: the newest update among the organization's job
// applications, or its own when it has none. `.orderBy` has no aggregates, so this is built
// from the AST, as a subquery correlated to the outer `organization` row.
// TODO: this builds Prisma 8 AST nodes by hand (8.0.0-rc.17), which can change between
//  releases. Check it on every Prisma upgrade (the "Last activity" sort fails at runtime, not in
//  tsc, if the outer table's name changes), or replace it with a denormalized `lastActivityAt`
//  column on Organization:
//   coalesce((select max(updated_at) from job_application
//             where organization_id = organization.id), organization.updated_at)
const lastActivityAt: Orderable = (() => {
  const newestApplicationUpdate = SubqueryExpr.of(
    SelectAst.from(TableSource.named('job_application', undefined, 'public'))
      .withProjection([
        ProjectionItem.of(
          'last_activity_at',
          AggregateExpr.max(ColumnRef.of('job_application', 'updated_at'))
        ),
      ])
      .withWhere(
        BinaryExpr.eq(
          ColumnRef.of('job_application', 'organization_id'),
          ColumnRef.of('organization', 'id')
        )
      )
  );
  const expr = FunctionCallExpr.of('coalesce', [
    newestApplicationUpdate,
    ColumnRef.of('organization', 'updated_at'),
  ]);

  return {
    asc: (options) => OrderByItem.asc(expr, options),
    desc: (options) => OrderByItem.desc(expr, options),
  };
})();

// Tiebreakers
export const ORGANIZATION_TIEBREAKERS: Tiebreakers<OrganizationAccessor> = [
  (o) => o.name.asc(),
  (o) => o.id.asc(),
];
