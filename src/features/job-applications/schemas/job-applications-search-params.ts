import type { SearchParamsState } from '@/lib/search-params.ts';
import { z } from 'zod';
import { getJobApplicationsQuerySchema } from '@/features/job-applications/schemas/get-job-applications-schema.ts';
import { DEFAULT_JOB_APPLICATION_SORT_BY } from '@/features/job-applications/constants/job-application-sorting.ts';
import { serializeSort } from '@/lib/sort.ts';

enum JobApplicationsSearchParam {
  Page = 'p',
  SortBy = 's',
}

const jobApplicationsSearchParamsSchema = z.object({
  page: getJobApplicationsQuerySchema.shape.page.catch(1),
  sortBy: getJobApplicationsQuerySchema.shape.sortBy
    .catch([])
    .transform((sortBy) => (sortBy.length > 0 ? sortBy : DEFAULT_JOB_APPLICATION_SORT_BY)),
});

export type JobApplicationsSearchParamsState = z.infer<typeof jobApplicationsSearchParamsSchema>;

export const jobApplicationsSearchParamsState: SearchParamsState<JobApplicationsSearchParamsState> =
  {
    keys: Object.values(JobApplicationsSearchParam),
    deserialize: (params) =>
      jobApplicationsSearchParamsSchema.parse({
        page: params.get(JobApplicationsSearchParam.Page) ?? undefined,
        sortBy: params.getAll(JobApplicationsSearchParam.SortBy),
      }),
    serialize: ({ page, sortBy }) => {
      const params = new URLSearchParams({ [JobApplicationsSearchParam.Page]: String(page) });
      serializeSort(sortBy).forEach((entry) =>
        params.append(JobApplicationsSearchParam.SortBy, entry)
      );
      return params;
    },
  };
