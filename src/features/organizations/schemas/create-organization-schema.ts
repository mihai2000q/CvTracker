import { z } from 'zod';
import { zEmptyToUndefined, zToArray } from '@/lib/zod/fields.ts';

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be blank').max(200, 'Name is too long'),
  notes: zEmptyToUndefined(z.string().trim().optional()),
  websiteUrl: zEmptyToUndefined(z.url('Website URL is invalid').optional()),
  countryIds: zToArray(
    z.array(z.uuid('Country must be identifiable')).min(1, 'Countries is required')
  ),
});

export type CreateOrganizationForm = z.infer<typeof createOrganizationSchema>;
