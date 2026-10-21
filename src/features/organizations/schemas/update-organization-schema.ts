import { z } from 'zod';
import { organizationSchema } from '@/features/organizations/schemas/organization-schema.ts';

export const updateOrganizationSchema = organizationSchema.extend({
  id: z.uuid('Organization must be identifiable'),
});

export type UpdateOrganizationForm = z.infer<typeof updateOrganizationSchema>;
