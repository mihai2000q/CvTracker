import React from 'react';
import Link from 'next/link';
import { RiExternalLinkLine } from '@remixicon/react';
import { Card } from '@/components/ui/card.tsx';
import PastDate from '@/components/date/past-date.tsx';
import { cn } from '@/lib/utils.ts';
import OrganizationAvatar from '@/features/organizations/components/organization/organization-avatar.tsx';
import JobApplicationContextMenu from '@/features/job-applications/components/job-application-context-menu.tsx';
import JobApplicationStatusBadge from '@/features/job-applications/components/status/job-application-status-badge.tsx';
import InterviewRoundHoverCard from '@/features/job-applications/components/interview/interview-round-hover-card.tsx';
import { isInterviewing } from '@/features/job-applications/types/job-application.ts';
import type { JobApplicationSummary } from '@/features/job-applications/types/job-application-summary.ts';

const CountryJobApplicationItem = ({
  jobApplication,
}: {
  jobApplication: JobApplicationSummary;
}) => {
  return (
    <JobApplicationContextMenu jobApplication={jobApplication}>
      <Card
        data-job-application-status={jobApplication.currentStatus}
        className={cn(
          'relative h-full gap-4 p-4',
          'hover:bg-muted hover:border-muted-foreground/50 transition-colors duration-125',
          'has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-2'
        )}
      >
        <div className={'absolute inset-x-0 top-0 h-1 bg-(--status-color)'} />

        <div className={'flex items-center gap-3'}>
          <OrganizationAvatar
            organization={jobApplication.organization}
            variant={'outline'}
            className={'size-11'}
          />
          <div className={'flex min-w-0 flex-1 flex-col gap-0.5'}>
            <Link
              href={`/jobs/${jobApplication.id}`}
              prefetch={false}
              title={jobApplication.title}
              className={'truncate font-semibold outline-none after:absolute after:inset-0'}
            >
              {jobApplication.title}
            </Link>
            <Link
              href={`/organizations/${jobApplication.organization.id}`}
              prefetch={false}
              title={jobApplication.organization.name}
              className={
                'link-underline text-muted-foreground relative z-10 w-fit max-w-full truncate text-xs'
              }
            >
              {jobApplication.organization.name}
            </Link>
          </div>
          {jobApplication.postingUrl && (
            <a
              href={jobApplication.postingUrl}
              target={'_blank'}
              rel={'noopener noreferrer'}
              aria-label={'Open job posting'}
              title={'Open the job posting'}
              className={
                'text-muted-foreground/60 hover:text-foreground relative z-10 shrink-0 self-start transition-colors'
              }
            >
              <RiExternalLinkLine className={'size-4'} />
            </a>
          )}
        </div>

        <div className={'mt-auto flex items-end justify-between gap-3'}>
          {/* Above the link that covers the card, so it can be hovered */}
          <div className={'relative z-10'}>
            {isInterviewing(jobApplication) ? (
              <InterviewRoundHoverCard rounds={jobApplication.interviewRounds}>
                <JobApplicationStatusBadge status={jobApplication.currentStatus} />
              </InterviewRoundHoverCard>
            ) : (
              <JobApplicationStatusBadge status={jobApplication.currentStatus} />
            )}
          </div>
          <div className={'text-muted-foreground text-xs'}>
            <PastDate date={jobApplication.appliedAt} />
          </div>
        </div>
      </Card>
    </JobApplicationContextMenu>
  );
};

export default CountryJobApplicationItem;
