import { z } from 'zod';
import { Temporal } from 'temporal-polyfill';
import type { ModelAccessor } from '@prisma/orm-postgres/orm-client';
import type { Contract } from '@database/contract.d';
import { fuzzy, similarTo } from '@database/filter.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

type JobApplicationAccessor = ModelAccessor<Contract, 'JobApplication', 'public'>;

// The day it was applied to is a date in the database, and the URL holds it as `YYYY-MM-DD`
const toPlainDate = (value: unknown) => Temporal.PlainDate.from(value as string);
const appliedAtColumn = (j: JobApplicationAccessor) => ({
  eq: (value: unknown) => j.appliedAt.eq(toPlainDate(value)),
  neq: (value: unknown) => j.appliedAt.neq(toPlainDate(value)),
  in: (values: unknown) => j.appliedAt.in((values as string[]).map(toPlainDate)),
  notIn: (values: unknown) => j.appliedAt.notIn((values as string[]).map(toPlainDate)),
  gt: (value: unknown) => j.appliedAt.gt(toPlainDate(value)),
  gte: (value: unknown) => j.appliedAt.gte(toPlainDate(value)),
  lt: (value: unknown) => j.appliedAt.lt(toPlainDate(value)),
  lte: (value: unknown) => j.appliedAt.lte(toPlainDate(value)),
});

export const JOB_APPLICATION_FILTERS = {
  status: {
    value: z.enum(JobApplicationStatus),
    column: (j: JobApplicationAccessor) => j.currentStatus,
  },
  organization: { value: z.uuid(), column: (j: JobApplicationAccessor) => j.organizationId },
  country: { value: z.uuid(), column: (j: JobApplicationAccessor) => j.countryId },
  source: z.string().min(1).max(100),
  cv: { value: z.uuid(), column: (j: JobApplicationAccessor) => j.cvDocumentId },
  appliedAt: { value: z.iso.date(), column: appliedAtColumn },
};
export type JobApplicationFilterField = keyof typeof JOB_APPLICATION_FILTERS;

// Both match what contains the term and, with `pg_trgm`, what is close to it
export const JOB_APPLICATION_SEARCH_COLUMNS = [
  fuzzy((j: JobApplicationAccessor) => j.title),
  (j: JobApplicationAccessor) => ({
    ilike: (pattern: string) => j.organization.some((o) => o.name.ilike(pattern)),
    similar: (term: string) => j.organization.some((o) => similarTo(o.name, term)),
  }),
];
