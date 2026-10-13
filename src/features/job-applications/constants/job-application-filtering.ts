import { z } from 'zod';
import type { ModelAccessor } from '@prisma/orm-postgres/orm-client';
import type { Contract } from '@database/contract.d';
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
};
export type JobApplicationFilterField = keyof typeof JOB_APPLICATION_FILTERS;

export const JOB_APPLICATION_SEARCH_COLUMNS = [
  (j: JobApplicationAccessor) => j.title,
  (j: JobApplicationAccessor) => ({
    ilike: (pattern: string) => j.organization.some((o) => o.name.ilike(pattern)),
  }),
];
