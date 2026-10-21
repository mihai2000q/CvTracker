import type { SearchParamsState } from '@/lib/search-params.ts';
import { z } from 'zod';
import { getJobApplicationsQuerySchema } from '@/features/job-applications/schemas/get-job-applications-schema.ts';
import { DEFAULT_JOB_APPLICATION_SORT_BY } from '@/features/job-applications/constants/job-application-sorting.ts';
import { serializeFilter } from '@/lib/filter.ts';
import { serializeSort } from '@/lib/sort.ts';

enum JobApplicationsSearchParam {
  Page = 'p',
  SortBy = 's',
  FilterBy = 'f',
  Search = 'q',
}

const jobApplicationsSearchParamsSchema = z.object({
  page: getJobApplicationsQuerySchema.shape.page.catch(1),
  sortBy: getJobApplicationsQuerySchema.shape.sortBy
    .catch([])
    .transform((sortBy) => (sortBy.length > 0 ? sortBy : DEFAULT_JOB_APPLICATION_SORT_BY)),
  // The applied-at control sets the two ends of a range, so any other comparison of it in the URL
  // is left out, rather than filtering with nothing in the toolbar to show it
  filterBy: getJobApplicationsQuerySchema.shape.filterBy
    .catch([])
    .transform((filterBy) =>
      filterBy.filter(
        ({ field, operator }) => field !== 'appliedAt' || operator === 'gte' || operator === 'lte'
      )
    ),
  search: getJobApplicationsQuerySchema.shape.search.catch(undefined),
});

export type JobApplicationsSearchParamsState = z.infer<typeof jobApplicationsSearchParamsSchema>;

export const jobApplicationsSearchParamsState: SearchParamsState<JobApplicationsSearchParamsState> =
  {
    keys: Object.values(JobApplicationsSearchParam),
    deserialize: (params) =>
      jobApplicationsSearchParamsSchema.parse({
        page: params.get(JobApplicationsSearchParam.Page) ?? undefined,
        sortBy: params.getAll(JobApplicationsSearchParam.SortBy),
        filterBy: params.getAll(JobApplicationsSearchParam.FilterBy),
        search: params.get(JobApplicationsSearchParam.Search) ?? undefined,
      }),
    serialize: ({ page, sortBy, filterBy, search }) => {
      const params = new URLSearchParams({ [JobApplicationsSearchParam.Page]: String(page) });
      serializeSort(sortBy).forEach((entry) =>
        params.append(JobApplicationsSearchParam.SortBy, entry)
      );
      serializeFilter(filterBy).forEach((entry) =>
        params.append(JobApplicationsSearchParam.FilterBy, entry)
      );
      if (search) params.set(JobApplicationsSearchParam.Search, search);
      return params;
    },
  };
