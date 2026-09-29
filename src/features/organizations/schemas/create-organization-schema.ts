import { z } from 'zod';
import { emptyToUndefined, toArray } from '@/lib/zod';

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be blank').max(200, 'Name is too long'),
  notes: emptyToUndefined(z.string().trim().optional()),
  websiteUrl: emptyToUndefined(z.url('Website URL is invalid').optional()),
  countryIds: toArray(
    z.array(z.uuid('Country must be identifiable')).min(1, 'Countries is required')
  ),
});

export type CreateOrganizationForm = z.infer<typeof createOrganizationSchema>;
