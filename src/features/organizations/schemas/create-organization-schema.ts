import { z } from 'zod';
import { organizationSchema } from '@/features/organizations/schemas/organization-schema.ts';

export const createOrganizationSchema = organizationSchema;

export type CreateOrganizationForm = z.infer<typeof createOrganizationSchema>;
