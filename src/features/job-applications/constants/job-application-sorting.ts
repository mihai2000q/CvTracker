import type { SortEntry } from '@/lib/sort.ts';
import type { ModelAccessor, Orderable } from '@prisma/orm-postgres/orm-client';
import {
  AggregateExpr,
  AndExpr,
  BinaryExpr,
  CaseExpr,
  ColumnRef,
  type AnyExpression,
  FunctionCallExpr,
  LiteralExpr,
  OrderByItem,
  ProjectionItem,
  SelectAst,
  SubqueryExpr,
  TableSource,
} from '@prisma/orm-postgres/relational-core/ast';
import type { Sorters, Tiebreakers } from '@database/sort.ts';
import type { Contract } from '@database/contract.d';
import { JOB_APPLICATION_STATUS_ORDER } from '@/features/job-applications/constants/job-application-statuses.ts';
import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';

// Fields
export const JOB_APPLICATION_SORT_FIELDS = [
  'title',
  'organization',
  'country',
  'source',
  'cv',
  'coverLetter',
  'status',
  'appliedAt',
  'nextInterview',
] as const;
export type JobApplicationSortField = (typeof JOB_APPLICATION_SORT_FIELDS)[number];

// Default Sort By
export const DEFAULT_JOB_APPLICATION_SORT_BY: SortEntry<JobApplicationSortField>[] = [
  { field: 'appliedAt', direction: 'desc' },
];

// Sorters
type JobApplicationAccessor = ModelAccessor<Contract, 'JobApplication', 'public'>;

export const jobApplicationSorters: Sorters<JobApplicationAccessor, JobApplicationSortField> = {
  title: (j) => j.title,
  organization: (j) => j.organization.name,
  country: (j) => j.country.name,
  source: (j) => j.source,
  cv: (j) => j.cvDocument.name,
  coverLetter: (j) => j.coverLetterDocument.name,
  appliedAt: (j) => j.appliedAt,
  status: () => status,
  nextInterview: () => nextInterview,
};

// `.orderBy` only takes columns and relation counts, so what is computed is built from the AST
const orderableOf = (expr: AnyExpression): Orderable => ({
  asc: (options) => OrderByItem.asc(expr, options),
  desc: (options) => OrderByItem.desc(expr, options),
});

// The status by how far along it is, not alphabetically: its position in
// `JOB_APPLICATION_STATUS_ORDER`
//   case current_status when 'applied' then 0 when 'screening' then 1 ... end
const status = orderableOf(
  CaseExpr.of(
    JOB_APPLICATION_STATUS_ORDER.map((jobApplicationStatus, rank) => ({
      condition: BinaryExpr.eq(
        ColumnRef.of('job_application', 'current_status'),
        LiteralExpr.of(jobApplicationStatus)
      ),
      value: LiteralExpr.of(rank),
    }))
  )
);

// The date of the earliest upcoming interview round that isn't cancelled, empty when there is
// none. `.orderBy` has no aggregates, so this is built from the AST, as a subquery correlated
// to the outer `job_application` row. Applications whose rounds are all past count as empty,
// where the table still shows their last round.
// TODO: hand-built Prisma 8 AST nodes (8.0.0-rc.17), like `lastActivityAt` in
//  organization-sorting.tsx: check it on every Prisma upgrade, since it fails at runtime, not
//  in tsc, if the outer table's name changes.
//   (select min(scheduled_at) from interview_round
//     where job_application_id = job_application.id
//       and outcome <> 'cancelled' and scheduled_at >= now())
const nextInterview = orderableOf(
  SubqueryExpr.of(
    SelectAst.from(TableSource.named('interview_round', undefined, 'public'))
      .withProjection([
        ProjectionItem.of(
          'next_interview',
          AggregateExpr.min(ColumnRef.of('interview_round', 'scheduled_at'))
        ),
      ])
      .withWhere(
        AndExpr.of([
          BinaryExpr.eq(
            ColumnRef.of('interview_round', 'job_application_id'),
            ColumnRef.of('job_application', 'id')
          ),
          BinaryExpr.neq(
            ColumnRef.of('interview_round', 'outcome'),
            LiteralExpr.of(InterviewOutcome.Cancelled)
          ),
          BinaryExpr.gte(
            ColumnRef.of('interview_round', 'scheduled_at'),
            FunctionCallExpr.of('now', [])
          ),
        ])
      )
  )
);

// Tiebreakers
export const JOB_APPLICATION_TIEBREAKERS: Tiebreakers<JobApplicationAccessor> = [
  (j) => j.title.asc(),
  (j) => j.id.asc(),
];
