import React from 'react';
import Link from 'next/link';
import {
  RiArrowRightLongLine,
  RiCalendarLine,
  RiEarthFill,
  RiExternalLinkLine,
  RiFileFill,
} from '@remixicon/react';
import {
  isInterviewing,
  JobApplicationSummary,
} from '@/features/job-applications/types/job-application.ts';
import JobApplicationStatusIndicator from '@/features/job-applications/components/status/job-application-status-indicator.tsx';
import JobApplicationStatusBadge from '@/features/job-applications/components/status/job-application-status-badge.tsx';
import JobApplicationSourceIcon from '@/features/job-applications/components/source/job-application-source-icon.tsx';
import InterviewRoundHoverCard from '@/features/job-applications/components/interview/interview-round-hover-card.tsx';
import DocumentHoverCard from '@/features/documents/components/document-hover-card.tsx';
import PastDate from '@/components/date/past-date.tsx';
import { cn } from '@/lib/utils.ts';

const OrganizationJobApplicationItem = ({
  jobApplication,
}: {
  jobApplication: JobApplicationSummary;
}) => {
  const statusBadge = <JobApplicationStatusBadge status={jobApplication.currentStatus} />;

  return (
    <div
      className={cn(
        'group relative flex cursor-pointer items-center justify-between gap-4 rounded-xl px-4 py-3',
        'hover:bg-muted transition-colors'
      )}
    >
      <div className={'flex min-w-0 items-center gap-4'}>
        <JobApplicationStatusIndicator status={jobApplication.currentStatus} />

        <div className={'flex min-w-0 flex-col'}>
          <div className={'flex items-center gap-1.5'}>
            <Link
              href={`/jobs/${jobApplication.id}`}
              prefetch={false}
              title={jobApplication.title}
              className={cn(
                'focus-visible:after:ring-ring outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2',
                'truncate text-base font-medium'
              )}
            >
              {jobApplication.title}
            </Link>
            {jobApplication.postingUrl && (
              <a
                href={jobApplication.postingUrl}
                target={'_blank'}
                rel={'noopener noreferrer'}
                aria-label={'Open job posting'}
                title={'Open the job posting'}
                className={
                  'text-muted-foreground/60 hover:text-foreground relative z-10 shrink-0 transition-colors'
                }
              >
                <RiExternalLinkLine className={'size-3.5 -translate-y-px'} />
              </a>
            )}
          </div>

          <div
            className={
              'text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs'
            }
          >
            <Link
              href={`/countries/${jobApplication.country.id}`}
              prefetch={false}
              className={'link-underline relative z-10 flex items-center gap-1'}
            >
              <RiEarthFill className={'size-3 -translate-y-px'} />
              {jobApplication.country.name}, {jobApplication.country.isoCode}
            </Link>
            <span aria-hidden>•</span>
            {jobApplication.source && (
              <span className={'flex gap-1.5 max-sm:hidden'}>
                <span className={'flex items-center gap-1'}>
                  <JobApplicationSourceIcon
                    source={jobApplication.source}
                    colored
                    className={'size-3 -translate-y-px'}
                  />
                  {jobApplication.source}
                </span>
                <span aria-hidden>•</span>
              </span>
            )}
            <DocumentHoverCard document={jobApplication.cv}>
              <Link
                href={`/documents/${jobApplication.cv.id}`}
                prefetch={false}
                className={
                  'link-underline relative z-10 flex w-fit max-w-40 items-center gap-1 max-md:hidden'
                }
              >
                <RiFileFill
                  data-document-type={jobApplication.cv.type}
                  className={'size-3 shrink-0 -translate-y-px text-(--document-color)'}
                />
                <span className={'truncate'}>{jobApplication.cv.name}</span>
              </Link>
            </DocumentHoverCard>
            <span aria-hidden className={'max-md:hidden'}>
              •
            </span>
            <span className={'flex items-center gap-1'}>
              <RiCalendarLine className={'size-3 -translate-y-px'} />
              <span className={'max-sm:hidden'}>Applied </span>
              <PastDate date={jobApplication.appliedAt} className={'relative z-10'} />
            </span>
          </div>
        </div>
      </div>

      <div className={'flex shrink-0 items-center gap-4'}>
        {isInterviewing(jobApplication) ? (
          <div className={'relative z-10'}>
            <InterviewRoundHoverCard rounds={jobApplication.interviewRounds}>
              {statusBadge}
            </InterviewRoundHoverCard>
          </div>
        ) : (
          statusBadge
        )}

        <RiArrowRightLongLine
          className={
            'text-muted-foreground size-4 transition-transform duration-150 group-hover:translate-x-1'
          }
        />
      </div>
    </div>
  );
};

export default OrganizationJobApplicationItem;
