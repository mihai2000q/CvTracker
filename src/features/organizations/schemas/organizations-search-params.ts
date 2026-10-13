import type { SearchParamsState } from '@/lib/search-params.ts';
import { z } from 'zod';
import { getOrganizationsQuerySchema } from '@/features/organizations/schemas/get-organizations-schema.ts';
import { DEFAULT_ORGANIZATION_SORT_BY } from '@/features/organizations/constants/organization-sorting.tsx';
import { serializeSort } from '@/lib/sort.ts';

enum OrganizationsSearchParam {
  Page = 'p',
  SortBy = 's',
}

const organizationsSearchParamsSchema = z.object({
  page: getOrganizationsQuerySchema.shape.page.catch(1),
  sortBy: getOrganizationsQuerySchema.shape.sortBy
    .catch([])
    .transform((sortBy) => (sortBy.length > 0 ? sortBy : DEFAULT_ORGANIZATION_SORT_BY)),
});

export type OrganizationsSearchParamsState = z.infer<typeof organizationsSearchParamsSchema>;

export const organizationsSearchParamsState: SearchParamsState<OrganizationsSearchParamsState> = {
  keys: Object.values(OrganizationsSearchParam),
  deserialize: (params) =>
    organizationsSearchParamsSchema.parse({
      page: params.get(OrganizationsSearchParam.Page) ?? undefined,
      sortBy: params.getAll(OrganizationsSearchParam.SortBy),
    }),
  serialize: ({ page, sortBy }) => {
    const params = new URLSearchParams({ [OrganizationsSearchParam.Page]: String(page) });
    serializeSort(sortBy).forEach((entry) => params.append(OrganizationsSearchParam.SortBy, entry));
    return params;
  },
};
