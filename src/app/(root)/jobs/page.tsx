import EmptyJobApplications from '@/features/job-applications/components/empty-job-applications.tsx';
import ListHeader from '@/components/list/list-header.tsx';
import ListFooter from '@/components/list/list-footer.tsx';
import { readListSearchParams } from '@/lib/search-params.ts';
import { redirect } from 'next/navigation';
import { jobApplicationsSearchParamsState } from '@/features/job-applications/schemas/job-applications-search-params.ts';
import { getJobApplications } from '@/features/job-applications/queries/get-job-applications.ts';
import JobApplicationsTable from '@/features/job-applications/components/job-applications-table.tsx';
import JobApplicationsToolbar from '@/features/job-applications/components/job-applications-toolbar.tsx';
import { countJobApplicationsByStatus } from '@/features/job-applications/queries/count-job-applications-by-status.ts';
import JobApplicationTabs from '@/features/job-applications/components/job-application-tabs.tsx';

const JobApplications = async ({ searchParams }: PageProps<'/jobs'>) => {
  const {
    values: { page, sortBy },
    hrefForPage,
    hrefForSortBy,
  } = readListSearchParams(jobApplicationsSearchParamsState, '/jobs', await searchParams);

  const [result, statusCounts] = await Promise.all([
    getJobApplications({ page, sortBy }),
    countJobApplicationsByStatus(),
  ]);
  if (!result.success) {
    redirect('/jobs');
  }

  const { items: jobApplications, totalCount } = result.data;

  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <ListHeader title="Job Applications" description="All your applications, in one place" />

      <main className={'flex flex-1 flex-col gap-4'}>
        {totalCount > 0 && <JobApplicationTabs counts={statusCounts} />}
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

      <ListFooter
        shown={jobApplications.length}
        totalCount={totalCount}
        noun="applications"
        page={page}
        hrefForPage={hrefForPage}
      />
    </div>
  );
};

export default JobApplications;
