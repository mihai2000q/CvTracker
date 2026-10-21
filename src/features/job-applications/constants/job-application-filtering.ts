import { z } from 'zod';
import type { ModelAccessor } from '@prisma/orm-postgres/orm-client';
import type { Contract } from '@database/contract.d';
import { dateColumn, fuzzy, similarTo } from '@database/filter.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

type JobApplicationAccessor = ModelAccessor<Contract, 'JobApplication', 'public'>;

export const JOB_APPLICATION_FILTERS = {
  status: {
    value: z.enum(JobApplicationStatus),
    column: (j: JobApplicationAccessor) => j.currentStatus,
  },
  organization: { value: z.uuid(), column: (j: JobApplicationAccessor) => j.organizationId },
  country: { value: z.uuid(), column: (j: JobApplicationAccessor) => j.countryId },
  source: z.string().min(1).max(100),
  cv: { value: z.uuid(), column: (j: JobApplicationAccessor) => j.cvDocumentId },
  appliedAt: {
    value: z.iso.date(),
    column: dateColumn((j: JobApplicationAccessor) => j.appliedAt),
  },
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
