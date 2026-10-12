import { z } from 'zod';
import { pagePaginationSchema } from '@/schemas/page-pagination-schema.ts';

export const getJobApplicationsQuerySchema = pagePaginationSchema.extend({});

export type GetJobApplicationsQueryInput = z.input<typeof getJobApplicationsQuerySchema>;
export type GetJobApplicationsQuery = z.output<typeof getJobApplicationsQuerySchema>;
