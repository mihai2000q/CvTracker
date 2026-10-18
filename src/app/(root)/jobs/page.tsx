import type { Metadata } from 'next';
import EmptyJobApplications from '@/features/job-applications/components/empty-job-applications.tsx';
import ListHeader from '@/components/list/list-header.tsx';
import ListFooter from '@/components/list/list-footer.tsx';
import NoResults from '@/components/list/no-results.tsx';
import { readListSearchParams } from '@/lib/search-params.ts';
import { redirect } from 'next/navigation';
import { jobApplicationsSearchParamsState } from '@/features/job-applications/schemas/job-applications-search-params.ts';
import { getJobApplications } from '@/features/job-applications/queries/get-job-applications.ts';
import JobApplicationsTable from '@/features/job-applications/components/job-applications-table.tsx';
import JobApplicationsToolbar from '@/features/job-applications/components/job-applications-toolbar.tsx';
import { countJobApplicationsByStatus } from '@/features/job-applications/queries/count-job-applications-by-status.ts';
import { getJobApplicationFiltersMetadata } from '@/features/job-applications/queries/get-job-application-filters-metadata.ts';
import JobApplicationTabs from '@/features/job-applications/components/job-application-tabs.tsx';

export const metadata: Metadata = { title: 'Jobs' };

const JobApplications = async ({ searchParams }: PageProps<'/jobs'>) => {
  const {
    values: { page, sortBy, filterBy, search },
    hrefForPage,
    hrefForSortBy,
    hrefForNoFilters,
    filterOption,
    filterToggle,
  } = readListSearchParams(jobApplicationsSearchParamsState, '/jobs', await searchParams);

  const [result, statusCounts, filtersMetadata] = await Promise.all([
    getJobApplications({ page, sortBy, filterBy, search }),
    countJobApplicationsByStatus(),
    getJobApplicationFiltersMetadata(),
  ]);
  if (!result.success) {
    redirect('/jobs');
  }

  const { items: jobApplications, totalCount } = result.data;
  const allCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <ListHeader title="Job Applications" description="All your applications, in one place" />

      <main className={'flex flex-1 flex-col gap-4'}>
        {allCount > 0 && <JobApplicationTabs counts={statusCounts} filterOption={filterOption} />}
        {allCount > 0 && (
          <JobApplicationsToolbar
            filtersMetadata={filtersMetadata}
            filterOption={filterOption}
            filterToggle={filterToggle}
          />
        )}

        {jobApplications.length > 0 && (
          <JobApplicationsTable
            jobApplications={jobApplications}
            sortBy={sortBy}
            hrefForSortBy={hrefForSortBy}
          />
        )}

        {allCount === 0 && <EmptyJobApplications />}
        {allCount > 0 && totalCount === 0 && (
          <NoResults noun="applications" clearHref={hrefForNoFilters()} />
        )}
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
