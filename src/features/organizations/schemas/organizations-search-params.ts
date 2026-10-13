import type { SearchParamsState } from '@/lib/search-params.ts';
import { z } from 'zod';
import { getOrganizationsQuerySchema } from '@/features/organizations/schemas/get-organizations-schema.ts';
import { DEFAULT_ORGANIZATION_SORT_BY } from '@/features/organizations/constants/organization-sorting.tsx';
import { serializeFilter } from '@/lib/filter.ts';
import { serializeSort } from '@/lib/sort.ts';

enum OrganizationsSearchParam {
  Page = 'p',
  SortBy = 's',
  FilterBy = 'f',
  Search = 'q',
}

const organizationsSearchParamsSchema = z.object({
  page: getOrganizationsQuerySchema.shape.page.catch(1),
  sortBy: getOrganizationsQuerySchema.shape.sortBy
    .catch([])
    .transform((sortBy) => (sortBy.length > 0 ? sortBy : DEFAULT_ORGANIZATION_SORT_BY)),
  filterBy: getOrganizationsQuerySchema.shape.filterBy.catch([]),
  search: getOrganizationsQuerySchema.shape.search.catch(undefined),
});

export type OrganizationsSearchParamsState = z.infer<typeof organizationsSearchParamsSchema>;

export const organizationsSearchParamsState: SearchParamsState<OrganizationsSearchParamsState> = {
  keys: Object.values(OrganizationsSearchParam),
  deserialize: (params) =>
    organizationsSearchParamsSchema.parse({
      page: params.get(OrganizationsSearchParam.Page) ?? undefined,
      sortBy: params.getAll(OrganizationsSearchParam.SortBy),
      filterBy: params.getAll(OrganizationsSearchParam.FilterBy),
      search: params.get(OrganizationsSearchParam.Search) ?? undefined,
    }),
  serialize: ({ page, sortBy, filterBy, search }) => {
    const params = new URLSearchParams({ [OrganizationsSearchParam.Page]: String(page) });
    serializeSort(sortBy).forEach((entry) => params.append(OrganizationsSearchParam.SortBy, entry));
    serializeFilter(filterBy).forEach((entry) =>
      params.append(OrganizationsSearchParam.FilterBy, entry)
    );
    if (search) params.set(OrganizationsSearchParam.Search, search);
    return params;
  },
};
