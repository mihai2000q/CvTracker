import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx';
import { Card } from '@/components/ui/card.tsx';
import OrganizationAvatar from '@/features/organizations/components/organization/organization-avatar.tsx';
import InterviewRoundsSection from '@/features/job-applications/components/interview/interview-rounds-section.tsx';
import JobApplicationActions from '@/features/job-applications/components/job-application-actions.tsx';
import JobApplicationDetailsCard from '@/features/job-applications/components/job-application-details-card.tsx';
import JobApplicationDocumentsCard from '@/features/job-applications/components/job-application-documents-card.tsx';
import JobApplicationStatusMenu from '@/features/job-applications/components/job-application-status-menu.tsx';
import StatusHistoryCard from '@/features/job-applications/components/status-history-card.tsx';
import { getJobApplication } from '@/features/job-applications/queries/get-job-application.ts';

const JobApplicationPage = async ({ params }: PageProps<'/jobs/[id]'>) => {
  const { id } = await params;

  const result = await getJobApplication(id);
  // An id that isn't one is as missing as one that matches no job application
  if (!result.success || !result.data) {
    notFound();
  }

  const jobApplication = result.data;

  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={'/jobs'} />}>Jobs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{jobApplication.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className={'flex flex-wrap items-start justify-between gap-x-6 gap-y-4'}>
        <div className={'flex min-w-0 items-center gap-4'}>
          <OrganizationAvatar
            organization={jobApplication.organization}
            variant={'outline'}
            className={'size-14'}
            letterClassName={'text-2xl'}
          />
          <div className={'flex min-w-0 flex-col gap-1'}>
            <h1 className={'text-3xl leading-tight font-bold break-words'}>
              {jobApplication.title}
            </h1>
            <div className={'text-muted-foreground flex flex-wrap items-center gap-x-2 text-sm leading-tight'}>
              <Link
                href={`/organizations/${jobApplication.organization.id}`}
                prefetch={false}
                className={'link-underline'}
              >
                {jobApplication.organization.name}
              </Link>
              <span aria-hidden>•</span>
              <Link
                href={`/countries/${jobApplication.country.id}`}
                prefetch={false}
                className={'link-underline'}
              >
                {jobApplication.country.name}
              </Link>
            </div>
          </div>
        </div>

        <div className={'flex flex-wrap items-center gap-3'}>
          <JobApplicationStatusMenu
            jobApplicationId={jobApplication.id}
            status={jobApplication.currentStatus}
          />
          <JobApplicationActions jobApplication={jobApplication} />
        </div>
      </header>

      <div className={'grid flex-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]'}>
        <main className={'flex min-w-0 flex-col gap-8'}>
          <InterviewRoundsSection
            jobApplication={jobApplication}
            rounds={jobApplication.interviewRounds}
          />

          {jobApplication.notes && (
            <section className={'flex flex-col gap-3'}>
              <h2 className={'text-lg font-semibold'}>Notes</h2>
              <Card className={'p-5'}>
                <p className={'text-sm whitespace-pre-line'}>{jobApplication.notes}</p>
              </Card>
            </section>
          )}
        </main>

        <aside className={'flex flex-col gap-4'}>
          <JobApplicationDetailsCard jobApplication={jobApplication} />
          <JobApplicationDocumentsCard
            cv={jobApplication.cv}
            coverLetter={jobApplication.coverLetter}
          />
          <StatusHistoryCard statusHistory={jobApplication.statusHistory} />
        </aside>
      </div>
    </div>
  );
};

export default JobApplicationPage;
