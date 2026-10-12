import type { SearchParamsState } from '@/lib/search-params.ts';
import { z } from 'zod';
import { getJobApplicationsQuerySchema } from '@/features/job-applications/schemas/get-job-applications-schema.ts';

enum JobApplicationsSearchParam {
  Page = 'p',
}

const jobApplicationsSearchParamsSchema = z.object({
  page: getJobApplicationsQuerySchema.shape.page.catch(1),
});

export type JobApplicationsSearchParamsState = z.infer<typeof jobApplicationsSearchParamsSchema>;

export const jobApplicationsSearchParamsState: SearchParamsState<JobApplicationsSearchParamsState> =
  {
    keys: Object.values(JobApplicationsSearchParam),
    deserialize: (params) =>
      jobApplicationsSearchParamsSchema.parse({
        page: params.get(JobApplicationsSearchParam.Page) ?? undefined,
      }),
    serialize: ({ page }) =>
      new URLSearchParams({ [JobApplicationsSearchParam.Page]: String(page) }),
  };
