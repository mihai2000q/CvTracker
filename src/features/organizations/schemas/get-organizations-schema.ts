import { z } from 'zod';
import { pagePaginationSchema } from '@/schemas/page-pagination-schema.ts';

export const getOrganizationsQuerySchema = pagePaginationSchema.extend({});

export type GetOrganizationsQueryInput = z.input<typeof getOrganizationsQuerySchema>;
export type GetOrganizationsQuery = z.output<typeof getOrganizationsQuerySchema>;
