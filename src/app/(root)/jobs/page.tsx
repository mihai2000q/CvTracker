import EmptyJobApplications from '@/features/job-applications/components/empty-job-applications.tsx';
import AppPagination from '@/components/pagination/app-pagination.tsx';
import { readListSearchParams } from '@/lib/search-params.ts';
import { redirect } from 'next/navigation';
import { jobApplicationsSearchParamsState } from '@/features/job-applications/schemas/job-applications-search-params.ts';
import { getJobApplications } from '@/features/job-applications/queries/get-job-applications.ts';
import JobApplicationsTable from '@/features/job-applications/components/job-applications-table.tsx';
import JobApplicationsToolbar from '@/features/job-applications/components/job-applications-toolbar.tsx';
import JobApplicationTabs from '@/features/job-applications/components/job-application-tabs.tsx';

const JobApplications = async ({ searchParams }: PageProps<'/jobs'>) => {
  const {
    values: { page, sortBy },
    hrefForPage,
    hrefForSortBy,
  } = readListSearchParams(jobApplicationsSearchParamsState, '/jobs', await searchParams);

  const result = await getJobApplications({ page, sortBy });
  if (!result.success) {
    redirect('/jobs');
  }

  const { items: jobApplications, totalCount } = result.data;

  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <header>
        <h1 className={'text-2xl font-bold'}>Job Applications</h1>
        <div className={'text-muted-foreground text-xs'}>All your applications, in one place</div>
      </header>

      <main className={'flex flex-1 flex-col gap-4'}>
        {totalCount > 0 && <JobApplicationTabs />}
        {totalCount > 0 && <JobApplicationsToolbar />}

        {jobApplications.length > 0 && (
          <JobApplicationsTable
            jobApplications={jobApplications}
            sortBy={sortBy}
            hrefForSortBy={hrefForSortBy}
          />
        )}

        {totalCount === 0 && <EmptyJobApplications />}
      </main>

      {totalCount > 0 && (
        <div className={'flex flex-wrap items-center justify-between gap-2 pt-4'}>
          <div className={'text-muted-foreground text-xs'}>
            Displaying {jobApplications.length} of {totalCount} applications
          </div>

          <AppPagination page={page} totalCount={totalCount} hrefForPage={hrefForPage} />
        </div>
      )}
    </div>
  );
};

export default JobApplications;
