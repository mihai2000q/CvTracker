import type { SearchParamsState } from '@/lib/search-params.ts';
import { z } from 'zod';
import { getOrganizationsQuerySchema } from '@/features/organizations/schemas/get-organizations-schema.ts';

enum OrganizationsSearchParam {
  Page = 'p',
}

const organizationsSearchParamsSchema = z.object({
  page: getOrganizationsQuerySchema.shape.page.catch(1),
});

export type OrganizationsSearchParamsState = z.infer<typeof organizationsSearchParamsSchema>;

export const organizationsSearchParamsState: SearchParamsState<OrganizationsSearchParamsState> = {
  keys: Object.values(OrganizationsSearchParam),
  deserialize: (params) =>
    organizationsSearchParamsSchema.parse({
      page: params.get(OrganizationsSearchParam.Page) ?? undefined,
    }),
  serialize: ({ page }) => new URLSearchParams({ [OrganizationsSearchParam.Page]: String(page) }),
};
